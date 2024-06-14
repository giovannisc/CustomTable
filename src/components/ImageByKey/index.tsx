import { useEffect, useState } from "react";
import Loader from "../Loader";

type URL = string;
interface Props extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
	imageKey: string;
	readFileRequest?: (imageKey: string) => Promise<{url: URL}> 
}
export default function ImageByKey(props: Props) {
	const [imageUrl, setImageUrl] = useState('');
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (props.imageKey.startsWith('http') || props.imageKey.startsWith('data:')) {
			setImageUrl(props.imageKey)
		} else {
			const loadImage = async () => {
				setLoading(true)
				try {
					if (!props.readFileRequest) {
						throw new Error("You need to pass function to read file")
					}
					const { url } = await props.readFileRequest(props.imageKey);
					setImageUrl(url);
				} catch (error) {
					console.error('Failed to load image', error);
				}
				setLoading(false)
			};
			loadImage();
		}

	}, [props.imageKey]);
	return (
		loading ?
			<Loader width={24} height={24} containerProps={{ className: "w-full h-full flex justify-center align-center p-10" }} />
			:
			<img
				src={imageUrl}
				{...props}
			/>
	);
};
