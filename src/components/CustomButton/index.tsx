interface CustomButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
}
function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ')
}
export default function CustomButton(Props: CustomButtonProps) {
	const { disabled, className } = Props
	return (
		<button
			{...Props}
			className={classNames(!disabled ? className || "" : "bg-gradient-to-r from-[#808080] to-[#b3b3b3] hover:bg-gradient-to-r hover:from-[#b3b3b3] hover:to-[#808080] text-white", "inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2")}
		/>
	)
}