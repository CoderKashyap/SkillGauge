import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QuizAttempt, User, Skill } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, Trophy, TrendingDown } from "lucide-react";

type AttemptWithRelations = QuizAttempt & { user: User; skill: Skill };

export default function AdminReports() {
  const [timeFilter, setTimeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const { data: attempts = [], isLoading } = useQuery<AttemptWithRelations[]>({
    queryKey: ["/api/quiz-attempts/all"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredAttempts = attempts.filter((attempt) => {
    let matches = true;

    if (timeFilter !== "all") {
      const attemptDate = new Date(attempt.completedAt);
      const now = new Date();
      if (timeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matches = matches && attemptDate >= weekAgo;
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matches = matches && attemptDate >= monthAgo;
      }
    }

    if (userFilter !== "all") {
      matches = matches && attempt.userId === userFilter;
    }

    return matches;
  });

  // User performance stats
  const userStats = filteredAttempts.reduce((acc, attempt) => {
    const userId = attempt.userId;
    if (!acc[userId]) {
      acc[userId] = {
        username: attempt.user.username,
        totalAttempts: 0,
        totalScore: 0,
        totalQuestions: 0,
      };
    }
    acc[userId].totalAttempts += 1;
    acc[userId].totalScore += attempt.score;
    acc[userId].totalQuestions += attempt.totalQuestions;
    return acc;
  }, {} as Record<string, { username: string; totalAttempts: number; totalScore: number; totalQuestions: number }>);

  const userPerformance = Object.entries(userStats).map(([userId, stats]) => ({
    username: stats.username,
    attempts: stats.totalAttempts,
    average: Math.round((stats.totalScore / stats.totalQuestions) * 100),
  })).sort((a, b) => b.average - a.average);

  // Skill gap analysis
  const skillStats = filteredAttempts.reduce((acc, attempt) => {
    const skillName = attempt.skill.name;
    if (!acc[skillName]) {
      acc[skillName] = { total: 0, count: 0 };
    }
    acc[skillName].total += (attempt.score / attempt.totalQuestions) * 100;
    acc[skillName].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const skillGaps = Object.entries(skillStats)
    .map(([skill, stats]) => ({
      skill,
      average: Math.round(stats.total / stats.count),
      attempts: stats.count,
    }))
    .sort((a, b) => a.average - b.average);

  const totalAttempts = filteredAttempts.length;
  const activeUsers = new Set(filteredAttempts.map(a => a.userId)).size;
  const avgScore = filteredAttempts.length > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / filteredAttempts.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Performance Reports</h2>
          <p className="text-muted-foreground mt-1">Analyze user performance and identify skill gaps</p>
        </div>
        <div className="flex gap-3">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-user-filter">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.filter(u => u.role === "user").map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-time-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No quiz attempts in this time period.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-attempts">{totalAttempts}</div>
                <p className="text-xs text-muted-foreground mt-1">Quiz completions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-active-users">{activeUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Participating learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-platform-avg">{avgScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">Platform-wide average</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Performance</CardTitle>
                <CardDescription>Average scores by user</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userPerformance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="username" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="average" fill="hsl(var(--chart-1))" name="Avg Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>Skills needing improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillGaps}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="skill" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="average" fill="hsl(var(--chart-3))" name="Avg Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Users with highest average scores</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPerformance.slice(0, 5).map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.attempts}</TableCell>
                        <TableCell>
                          <Badge variant={user.average >= 80 ? "default" : "secondary"}>
                            {user.average}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Gaps</CardTitle>
                <CardDescription>Skills with lowest average scores</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillGaps.slice(0, 5).map((skill, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{skill.skill}</TableCell>
                        <TableCell>{skill.attempts}</TableCell>
                        <TableCell>
                          <Badge variant={skill.average < 70 ? "destructive" : "secondary"}>
                            {skill.average}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
