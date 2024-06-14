import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

interface SearchInputFormProps {
    onSubmit: (value: string) => Promise<void>;
    placeHolder: string;
}

export default function SearchInputForm(Props: SearchInputFormProps) {
    const [loading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")
    return (
        <form className="relative flex h-12 sm:w-full" onSubmit={(e) => {
            e.preventDefault()
            setIsLoading(true)
            if (Props.onSubmit) {
                Props.onSubmit(search)
                    .then(() => {
                        setIsLoading(false)
                    })
                    .catch(() => {
                        setIsLoading(false)
                    })
            } else {
                setIsLoading(false)
            }
        }}>
            <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-2 h-full w-5"
                aria-hidden="true"
            />
            <input
                id="search-field"
                className="block w-full rounded-md border-1 pl-8 py-3 shadow-sm sm:leading-6"
                placeholder={Props.placeHolder}
                type="search"
                name="search"
                onChange={(e) => {
                    setSearch(e.target.value)
                }}
            />
            {loading &&
                <>{/* Loader here */}</>
            }
        </form>
    )
}