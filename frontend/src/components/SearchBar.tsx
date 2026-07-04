import "./SearchBar.css";

interface Props{
    value:string;
    onChange:(value:string)=>void;
}

export default function SearchBar({
    value,
    onChange,
}:Props){

    return(

        <input
            className="search-bar"
            placeholder="Search bug..."
            value={value}
            onChange={(e)=>onChange(e.target.value)}
        />

    );

}