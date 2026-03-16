'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface CreatableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
}

export function CreatableSelect({ value, onChange, options, placeholder = "Select option..." }: CreatableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Check if the search query matches an existing option exactly
    const hasExactMatch = filteredOptions.some(
        (option) => option.toLowerCase() === searchQuery.toLowerCase()
    );

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setOpen(false);
        setSearchQuery(""); // Reset search on select
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-left"
                >
                    {value ? (
                        <span className="truncate">{value}</span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2 border-b">
                    <Input
                        placeholder="Search or create new..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 focus-visible:ring-1"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                    {filteredOptions.length === 0 && !searchQuery && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No options found.
                        </div>
                    )}

                    {filteredOptions.map((option) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                value === option && "bg-accent text-accent-foreground"
                            )}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === option ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {option}
                        </div>
                    ))}

                    {/* Show "Create" option if search query exists and isn't an exact match */}
                    {searchQuery && !hasExactMatch && (
                        <div
                            onClick={() => handleSelect(searchQuery)}
                            className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer border-t mt-1 text-blue-500 font-medium"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{searchQuery}"
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
