import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Tìm tên sự kiện, nghệ sĩ, địa điểm...",
  buttonLabel = "Tìm kiếm",
  large = false,
  className = "",
}) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      onSubmit={submit}
      className={`flex items-center gap-2 rounded-lg border border-line bg-white p-1.5 shadow-sm ${className}`}
      role="search"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center text-muted-2">
        <Search size={17} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Tìm kiếm sự kiện"
        className={`min-w-0 flex-1 bg-transparent text-ink-900 outline-none placeholder:text-[#a2a5ab] ${
          large ? "text-[15px]" : "text-sm"
        }`}
      />
      <button type="submit" className={`btn btn-primary ${large ? "" : "btn-sm"} shrink-0`}>
        {buttonLabel}
      </button>
    </form>
  );
}
