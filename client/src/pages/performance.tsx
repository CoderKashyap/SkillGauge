import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QuizAttempt, Skill } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowLeft, TrendingUp, AlertTriangle, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

type AttemptWithSkill = QuizAttempt & { skill: Skill };

export default function Performance() {
  const { user, logout } = useAuth();
  const [timeFilter, setTimeFilter] = useState("all");

  const { data: attempts = [], isLoading } = useQuery<AttemptWithSkill[]>({
    queryKey: ["/api/quiz-attempts/my-attempts"],
  });

  const filteredAttempts = attempts.filter((attempt) => {
    if (timeFilter === "all") return true;
    const attemptDate = new Date(attempt.completedAt);
    const now = new Date();
    
    if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return attemptDate >= weekAgo;
    }
    if (timeFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return attemptDate >= monthAgo;
    }
    return true;
  });

  // Prepare chart data
  const scoreOverTime = filteredAttempts
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .map((attempt) => ({
      date: new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round((attempt.score / attempt.totalQuestions) * 100),
      skill: attempt.skill.name,
    }));

  // Skill performance
  const skillStats = filteredAttempts.reduce((acc, attempt) => {
    const skillName = attempt.skill.name;
    if (!acc[skillName]) {
      acc[skillName] = { total: 0, count: 0 };
    }
    acc[skillName].total += (attempt.score / attempt.totalQuestions) * 100;
    acc[skillName].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const skillPerformance = Object.entries(skillStats).map(([skill, stats]) => ({
    skill,
    average: Math.round(stats.total / stats.count),
    attempts: stats.count,
  })).sort((a, b) => a.average - b.average);

  const skillGaps = skillPerformance.filter(s => s.average < 70);
  const strongSkills = skillPerformance.filter(s => s.average >= 80);

  const overallAverage = filteredAttempts.length > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / filteredAttempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={logout} data-testid="button-logout">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Performance Report</h2>
              <p className="text-muted-foreground">Track your learning progress and identify areas for improvement</p>
            </div>
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
                    <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" data-testid="text-overall-avg">{overallAverage}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all quizzes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strong Skills</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-2" data-testid="text-strong-skills">{strongSkills.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Scoring 80% or higher</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-3" data-testid="text-skill-gaps">{skillGaps.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Below 70% - needs practice</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Tabs defaultValue="trend" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="trend" data-testid="tab-trend">Score Trend</TabsTrigger>
                  <TabsTrigger value="skills" data-testid="tab-skills">Skills Breakdown</TabsTrigger>
                  <TabsTrigger value="attempts" data-testid="tab-attempts">Recent Attempts</TabsTrigger>
                </TabsList>

                <TabsContent value="trend" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Score Over Time</CardTitle>
                      <CardDescription>Track your performance across all quizzes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={scoreOverTime}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis domain={[0, 100]} className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.375rem'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="hsl(var(--chart-1))" 
                            strokeWidth={2}
                            name="Score (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance by Skill</CardTitle>
                      <CardDescription>Average scores across different skill categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillPerformance}>
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
                          <Bar dataKey="average" fill="hsl(var(--chart-1))" name="Average Score (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attempts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Attempts</CardTitle>
                      <CardDescription>Your quiz attempt history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredAttempts
                          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                          .map((attempt) => (
                            <div 
                              key={attempt.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                              data-testid={`attempt-${attempt.id}`}
                            >
                              <div className="space-y-1">
                                <p className="font-medium" data-testid={`text-skill-${attempt.id}`}>{attempt.skill.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(attempt.completedAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold" data-testid={`text-score-${attempt.id}`}>
                                  {attempt.score}/{attempt.totalQuestions}
                                </div>
                                <Badge 
                                  variant={
                                    (attempt.score / attempt.totalQuestions) >= 0.8 ? "default" :
                                    (attempt.score / attempt.totalQuestions) >= 0.7 ? "secondary" :
                                    "destructive"
                                  }
                                >
                                  {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Skill Gaps */}
              {skillGaps.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Areas for Improvement</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {skillGaps.map((skill) => (
                      <Card key={skill.skill}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{skill.skill}</CardTitle>
                            <Badge variant="destructive">{skill.average}%</Badge>
                          </div>
                          <CardDescription>
                            {skill.attempts} attempt{skill.attempts !== 1 ? 's' : ''} - Practice more to improve
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full">
                              Practice Now
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
