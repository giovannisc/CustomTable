interface RoundButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
}
function classNames(...classes: (string | boolean)[]) {
	return classes.filter(Boolean).join(' ')
}
export default function RoundButton(Props: RoundButtonProps) {
	const { disabled, children } = Props
	return (
		<button
			{...Props}
			type="button"
			className={classNames(!disabled ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-gray-400 text-gray-700 hover:bg-gray-400", "rounded-full p-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600")}
		>
			{children}
		</button>
	)
}