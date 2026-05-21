import { Search, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (address: string) => void | Promise<void>;
  loading?: boolean;
}

const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
      {loading ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar dirección (ej: Av. Providencia 123, Santiago)"
        className="w-full pl-10 pr-20 py-2.5 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
