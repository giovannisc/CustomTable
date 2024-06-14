import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { ChevronUpIcon } from '@heroicons/react/20/solid'

interface MenuListProps {
	buttonLabel: string;
	menuOptions?: any[];
	onChange: ((menuOption: any) => void);
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ')
}

export default function MenuList(Props: MenuListProps) {
	const {
		buttonLabel,
		menuOptions,
		onChange
	} = Props;

	return (
		<Menu as="div" className="absolute inline-block text-left">
			<div>
				<Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md  px-3 py-2 text-sm font-semibold  shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
					{
						({ open }) => (
							<>
								{buttonLabel}
								{open ? 
									<ChevronDownIcon className="-mr-1 h-5 w-5" aria-hidden="true" />
									:
									<ChevronUpIcon className="-mr-1 h-5 w-5" aria-hidden="true" />}
							</>
						)
					}
				</Menu.Button>
			</div>

			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute left-0 z-10 mt-0 w-auto min-w-28 origin-top-right rounded-[100px]  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<div className="py-1">
						{(menuOptions || []).map((menuOption, index) => (
							<Menu.Item key={index}>
								{({ focus }) => (
									<a
										onClick={() => onChange&&onChange(menuOption)}
										className={classNames(
											focus ? 'bg-gray-100 text-gray-900 text-[1.1rem]' : 'text-bold text-[1.1rem] bg-[#00AAFF44]',
											'block px-4 py-2 text-sm'
										)}
									>
										{menuOption}
									</a>
								)}
							</Menu.Item>
						))}
					</div>
				</Menu.Items>
			</Transition>
		</Menu>
	)
}
