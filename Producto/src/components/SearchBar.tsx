import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar material o punto limpio..."
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
    </div>
  );
};

export default SearchBar;
