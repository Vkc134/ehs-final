import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pill,
    Clock,
    CheckCircle,
    Users,
    Activity,
    Filter,
} from "lucide-react";

const SummaryCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    colorClass,
    iconColorClass,
    filterValue,
    onFilterChange,
    showFilter = false,
}) => (
    <Card className={`relative overflow-hidden ${colorClass} transition-all duration-300 hover:shadow-lg`}>
        <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${iconColorClass} backdrop-blur-sm`}>
                    <Icon className="w-5 h-5" />
                </div>
                {showFilter && (
                    <Select value={filterValue} onValueChange={onFilterChange}>
                        <SelectTrigger className="w-[110px] h-8 text-[11px] bg-white/10 border-white/20 text-current hover:bg-white/20 transition-colors">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="lastMonth">Last Month</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium opacity-80">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    {subtext && !showFilter && (
                        <p className="text-[11px] opacity-70 font-medium">{subtext}</p>
                    )}
                </div>
                {showFilter && (
                    <p className="text-[11px] opacity-70 font-medium">
                        {filterValue === 'today' ? 'Today' :
                            filterValue === 'week' ? 'This Week' :
                                filterValue === 'month' ? 'This Month' :
                                    filterValue === 'lastMonth' ? 'Last Month' : 'All Time'}
                    </p>
                )}
            </div>
        </CardContent>

        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <Icon size={100} />
        </div>
    </Card>
);

const SummaryCards = ({ stats }) => {
    const cards = [
        {
            title: "Total Prescriptions",
            value: stats.total || 0,
            icon: Pill,
            colorClass: "bg-blue-600 text-white",
            iconColorClass: "bg-white/20",
            showFilter: true,
            filterValue: stats.totalFilter,
            onFilterChange: stats.setTotalFilter,
        },
        {
            title: "Pending",
            value: stats.pending || 0,
            subtext: "Awaiting dispensing",
            icon: Clock,
            colorClass: "bg-amber-500 text-white",
            iconColorClass: "bg-white/20",
            showFilter: false, // Pending is usually current status, not time filtered
        },
        {
            title: "Dispensed",
            value: stats.dispensed || 0,
            icon: Activity,
            colorClass: "bg-white text-slate-900 border border-slate-200",
            iconColorClass: "bg-blue-50 text-blue-600",
            showFilter: true,
            filterValue: stats.dispensedFilter,
            onFilterChange: stats.setDispensedFilter,
        },
        {
            title: "Patients Served",
            value: stats.patients || 0,
            icon: Users,
            colorClass: "bg-white text-slate-900 border border-slate-200",
            iconColorClass: "bg-indigo-50 text-indigo-600",
            showFilter: true,
            filterValue: stats.patientsFilter,
            onFilterChange: stats.setPatientsFilter,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
};

export default SummaryCards;
