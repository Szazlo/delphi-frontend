import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"

interface Manager {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface ReviewerComboboxProps {
    managers: Manager[];
    selectedReviewer: Manager | null;
    setSelectedReviewer: (reviewer: Manager | null) => void;
}

export function ReviewerCombobox({ managers, selectedReviewer, setSelectedReviewer }: ReviewerComboboxProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedReviewer
                        ? `${selectedReviewer.firstName} ${selectedReviewer.lastName}`
                        : "Select reviewer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search reviewer..." />
                    <CommandList>
                        <CommandEmpty>No reviewer found.</CommandEmpty>
                        <CommandGroup>
                            {managers.map((manager) => (
                                <CommandItem
                                    key={manager.id}
                                    value={manager.id}
                                    onSelect={() => {
                                        setSelectedReviewer(manager);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedReviewer?.id === manager.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {manager.username}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}