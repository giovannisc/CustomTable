import { ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import ImageByKey from '../ImageByKey';
import SearchInputForm from '../SearchInputForm';
import PaginationBar from '../PaginationBar';
import RoundButton from '../RoundButton';
import Loader from '../Loader';
import CustomButton from '../CustomButton';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Column {
	title: string;
	type: string;
	key: string;
	className?: string;
	hidden?: boolean;
	sort?: boolean | ((a: any, b: any) => number);
}

interface DataRelational {
	count: number;
	totalCount: number;
	results: Record<string, any>[];
}

interface DataNotRelational {
	count: number;
	lastId: string;
	results: Record<string, any>[];
}

interface Action {
	name: string;
	action: (rowData: Record<string, any>) => Promise<void>;
	icon: any;
	isFreeAction?: boolean;
}

type Data = DataRelational | DataNotRelational

interface CustomTableProps {
	data: Record<string, any>[] | any
	loading: boolean;
	isSearchable: boolean;
	title: string;
	subtitle: string;
	addButtonTitle?: string;
	columns: Column[];
	onCreate?: (rowData: Record<string, any>) => Promise<any>;
	onUpdate?: (rowData: Record<string, any>) => Promise<any>;
	onDelete?: (rowData: Record<string, any>) => Promise<any>;
	onChangeSort?: (sortColumn: SortColumn | null) => Promise<any>;
	editLabel: string;
	defaultPageSizeOptions?: number[];
	isRelational: boolean;
	areYouSureLabel?: string;
	areYouSureLabelYes?: string;
	areYouSureLabelNo?: string;
	refresh?: boolean;
	customActions?: Action[]
}

interface SortColumn {
	key: string;
	order: "asc" | "desc";
}

function formatDateTime(date: Date) {
	// Função auxiliar para adicionar zero à esquerda se necessário
	const padTo2Digits = (num: number) => num.toString().padStart(2, '0');

	return [
		padTo2Digits(date.getDate()), // Dia
		padTo2Digits(date.getMonth() + 1), // Mês (getMonth() retorna um índice baseado em zero)
		date.getFullYear(), // Ano
	].join('/') + ' ' + [
		padTo2Digits(date.getHours()), // Horas
		padTo2Digits(date.getMinutes()), // Minutos
		padTo2Digits(date.getSeconds()), // Segundos
	].join(':');
}

function getValueFromRowData(rowData: any, column: Column): import("react").ReactNode {
	let value: any = rowData
	for (let childKey of column.key.split('.')) {
		value = value[childKey]
	}
	if (column.type === "image") {
		return (
			<div className="h-11 w-11 flex-shrink-0">
				<ImageByKey className="h-11 w-11 rounded-full" alt="" imageKey={value} />
			</div>
		)
	}
	if (column.type === "date-time") {
		return formatDateTime(new Date(value))
	}
	if (column.type === "date") {
		return formatDateTime(new Date(value)).split(' ')[0]
	}
	return value
}

const CustomTable = forwardRef((Props: CustomTableProps, ref: any) => {
	const {
		data, loading, isSearchable,
		columns, title, subtitle, addButtonTitle,
		onCreate, onUpdate, onDelete,
		editLabel, defaultPageSizeOptions,
		isRelational, areYouSureLabel, areYouSureLabelYes, areYouSureLabelNo,
		refresh, customActions
	} = Props
	const actions: Record<string, any> = {
		onCreate, onUpdate, onDelete
	}
	const [dataObj, setDataObj] = useState<Data>({
		count: 0,
		totalCount: 0,
		results: []
	});
	const [sortColumn, setSortColumn] = useState<SortColumn>({
		key: columns[0].key,
		order: 'asc'
	})
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [pageSizeOptions, _] = useState<number[]>(defaultPageSizeOptions || [5, 10, 20]);
	const [pageSize, setPageSize] = useState<number>(pageSizeOptions[0]);
	const [nextEnabled, setNextEnabled] = useState(true)
	const [previousEnabled, setPreviousEnabled] = useState(false)
	const [lastId, setLastId] = useState<string[]>([]);
	const [errorData, setErrorData] = useState<any>(null);
	const [rowToDoAction, setRowToDoAction] = useState<any>(null);
	const [actionToDo, setActionToDo] = useState<string>("");
	const [retry, setRetry] = useState(2);
	const runData = useCallback(() => {
		if (!loading && typeof data === 'object') {
			const _dataObj = {
				count: 0,
				totalCount: 0,
				results: data
			}
			_dataObj.results = _dataObj.results.filter((result: any) => JSON.stringify(result).toLocaleLowerCase().search(search.toLocaleLowerCase()) > -1)
			_dataObj.results = _dataObj.results.sort((a: any, b: any) => {
				if (a[sortColumn.key] > b[sortColumn.key]) {
					return sortColumn?.order === 'asc' ? 1 : -1
				} else {
					return sortColumn?.order === 'asc' ? -1 : 1
				}
			})
			_dataObj.totalCount = _dataObj.results.length
			_dataObj.results = _dataObj.results.slice(page * pageSize, (page + 1) * pageSize)
			_dataObj.count = _dataObj.results.length
			setDataObj(_dataObj)
		} else if (!loading && typeof data === 'function') {
			if (isRelational) {
				data(pageSize, page * pageSize, sortColumn.key, sortColumn.order, search)
					.then((response: DataRelational) => {
						setDataObj(response)
						setErrorData(null)
						setRetry(2)
					})
					.catch((error: any) => {
						if(retry){
							runData()
							setRetry(retry - 1)
						} else {
							setErrorData(Array.isArray(error) ? error[0] : error)
						}
					})
			} else {
				data(pageSize, page > 0 ? lastId[page - 1] : null, search)
					.then((response: DataNotRelational) => {
						let _lastId = [...lastId]
						if (_lastId.length - page === 0) {
							_lastId.push(response.lastId)
						}
						setLastId(_lastId)
						setNextEnabled(!!response.lastId)
						setPreviousEnabled(page > 0)
						setDataObj(response)
						setErrorData(null)
						setRetry(2)
					})
					.catch((error: any) => {
						if(retry){
							runData()
							setRetry(retry - 1)
						} else {
							setErrorData(Array.isArray(error) ? error[0] : error)
						}
					})
			}
		}
	}, [data, page, pageSize, sortColumn, search, loading, isRelational, lastId, dataObj, retry])

	const handleDoAction = useCallback(() => {
		actions[actionToDo] && actions[actionToDo](dataObj.results[rowToDoAction])
			.then(() => {
				runData()
				setRowToDoAction(null)
				setActionToDo("")
			})
			.catch((error: any) => {
				setErrorData(Array.isArray(error) ? error[0] : error)
				setRowToDoAction(null)
				setActionToDo("")
			})
	}, [actions, actionToDo, runData, dataObj])

	useImperativeHandle(ref, () => ({
		refresh: runData
	}));

	const [avoidRunOnStart, setAvoidRunOnStart] = useState(false)
	useEffect(() => {
		if (avoidRunOnStart) {
			runData()
		} else {
			setAvoidRunOnStart(true)
		}
	}, [page, pageSize, sortColumn, search, avoidRunOnStart])

	return (
		<div className="p-10 border-2 rounded-lg w-full sm:px-6 lg:px-8">
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<h2 className="leading-6">{title}</h2>
					<p className="mt-2">
						{subtitle}
					</p>
				</div>
				{isSearchable &&
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<SearchInputForm
							onSubmit={(value) => {
								setSearch(value)
								return Promise.resolve()
							}}
							placeHolder={'Pesquisar'} />
					</div>
				}
				<div className='flex max-w-[150px] gap-2 p-5'>
					{ref.current && ref.current.refresh && refresh &&
						<div>
							<RoundButton
								onClick={() => ref?.current.refresh()}
							>
								{addButtonTitle || <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />}
							</RoundButton>
						</div>
					}
					{!!onCreate &&
						<div>
							<RoundButton
								onClick={onCreate}
							>
								{addButtonTitle || <PlusIcon className="h-5 w-5" aria-hidden="true" />}
							</RoundButton>
						</div>
					}
				</div>

			</div>
			<div className="mt-8 flow-root">
				<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
						<table className="min-w-full divide-y ">
							<thead className="border-t border-b">
								<tr>
									{columns.map((column) => (
										<th key={column.key} hidden={!!column.hidden} scope="col" className="py-3.5  pl-4 text-left font-semibold">
											<a onClick={() => {
												setSortColumn({
													key: column.key,
													order: sortColumn.order === "asc" ? "desc" : "asc"
												})
											}} className="group inline-flex">
												{column.title}
												{!sortColumn || sortColumn.key !== column.key ?
													<span className="invisible ml-2 flex-none rounded group-hover:visible group-focus:visible">
														<ChevronDownIcon className="h-5 w-5" aria-hidden="true" onClick={() => {
															setSortColumn({
																key: column.key,
																order: "asc"
															})
														}} />
													</span>
													:
													sortColumn.key === column.key && sortColumn.order === "asc" ?
														<span className="ml-2 flex-none rounded bg-gray-100 group-hover:bg-gray-200">
															<ChevronDownIcon className="h-5 w-5" aria-hidden="true" onClick={() => {
																setSortColumn({
																	key: column.key,
																	order: "desc"
																})
															}} />
														</span>
														:
														<span className="ml-2 flex-none rounded bg-gray-100 group-hover:bg-gray-200">
															<ChevronUpIcon className="h-5 w-5" aria-hidden="true" onClick={() => {
																setSortColumn({
																	key: column.key,
																	order: "asc"
																})
															}} />
														</span>
												}
											</a>
										</th>
									))}
									{(!!onUpdate || !!onDelete || !!(customActions || []).filter((action) => (action.isFreeAction === undefined || action.isFreeAction)).length) &&
										<th scope="col" className="py-3.5 pl-4 text-left font-semibold">
											<a className="group inline-flex">
												{editLabel || "Ações"}
											</a>
										</th>
									}
								</tr>
							</thead>
							{!errorData && !loading &&
								<tbody className="divide-y min-w-full">
									{(dataObj.results || []).map((rowData, i) => (
										<tr key={rowData.id}>
											{rowToDoAction === i ?
												<td className='flex justify-between items-center w-full min-h-20'>
													<div className='flex  justify-start items-center w-full'>
														{areYouSureLabel || "Are you sure?"}
													</div>
													<div className='flex  justify-end items-center gap-2'>
														<CustomButton onClick={handleDoAction}>
															{areYouSureLabelYes || "Yes"}
														</CustomButton>
														<CustomButton onClick={() => {
															setRowToDoAction(null)
														}}>
															{areYouSureLabelNo || "No"}
														</CustomButton>
													</div>
												</td>
												:
												(columns || []).map((column, j) => (
													<td key={j} hidden={!!column.hidden} className={column.className || "whitespace-nowrap px-3 py-4 text-sm"}>
														{getValueFromRowData(rowData, column)}
													</td>
												))
											}
											{(!!onUpdate || !!onDelete || !!(customActions || []).filter((action) => (action.isFreeAction === undefined || action.isFreeAction))) && rowToDoAction !== i &&
												<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm sm:pr-0">
													<div className='flex justify-center items-center max-w-[100px] gap-2'>
														{!!onUpdate &&
															<RoundButton
																onClick={
																	() => {
																		setRowToDoAction(i)
																		setActionToDo("onUpdate")
																	}
																}
															>
																<PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
															</RoundButton>
														}
														{!!onDelete &&
															<RoundButton
																onClick={
																	() => {
																		setRowToDoAction(i)
																		setActionToDo("onDelete")
																	}
																}
															>
																<TrashIcon className="h-5 w-5" aria-hidden="true" />
															</RoundButton>
														}
														{(customActions || []).filter((action) => (action.isFreeAction === undefined || action.isFreeAction)).map((action) => (
															<RoundButton
																onClick={action.action && (() => action.action(rowData))}
															>
																{action.icon || action.name}
															</RoundButton>
														))}
													</div>
												</td>
											}
										</tr>
									))}
								</tbody>
							}
						</table>
						{!!errorData && !loading &&
							<div className="flex w-full h-full justify-center items-center text-center p-10">
								<p>
									{errorData.message || errorData.toString()}
								</p>
							</div>
						}
						{loading &&
							<div className="flex w-full h-full justify-center items-center text-center p-10 bg-opacity-10">
								<Loader
									containerProps={{ className: "w-full h-full flex justify-center align-center p-10" }} width={'40px'} height={'40px'}
								/>
							</div>
						}
						{!errorData &&
							< PaginationBar
								labelShowing="Mostrando"
								labelResults="resultados"
								rows={dataObj.count}
								nextEnabled={nextEnabled}
								previousEnabled={previousEnabled}
								nextLabel='Próximo'
								previousLabel='Anterior'
								onNextPage={() => setPage(page + 1)}
								onPreviousPage={() => setPage(page > 0 ? page - 1 : 0)}
								onChangePageSize={(_pageSize) => setPageSize(_pageSize)}
								pageSizeOptions={pageSizeOptions}
							/>
						}
					</div>
				</div>
			</div>
		</div>
	)
})

export default CustomTable;