import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your architectural decisions</p>
          </div>
          <Button asChild>
            <Link to="/decisions/new">
              <Plus className="mr-2 h-4 w-4" />
              New Decision
            </Link>
          </Button>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{column.title}</h2>
                <Badge variant={column.badgeVariant}>{column.count}</Badge>
              </div>
              <div className="space-y-4">
                {column.cards.map((card) => (
                  <Card key={card.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.project}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Due: {card.dueDate}</span>
                        <Badge variant={card.statusVariant}>{card.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const columns = [
  {
    id: "pending",
    title: "Pending",
    count: 3,
    badgeVariant: "yellow" as const,
    cards: [
      {
        id: "1",
        title: "Database Selection",
        project: "Project Alpha",
        dueDate: "2024-01-15",
        status: "Pending",
        statusVariant: "yellow" as const,
      },
    ],
  },
  {
    id: "waiting",
    title: "Waiting for Client",
    count: 2,
    badgeVariant: "blue" as const,
    cards: [
      {
        id: "2",
        title: "API Framework Choice",
        project: "Project Beta",
        dueDate: "2024-01-20",
        status: "Waiting",
        statusVariant: "blue" as const,
      },
    ],
  },
  {
    id: "decided",
    title: "Decided",
    count: 5,
    badgeVariant: "green" as const,
    cards: [],
  },
  {
    id: "overdue",
    title: "Overdue",
    count: 1,
    badgeVariant: "red" as const,
    cards: [],
  },
];
