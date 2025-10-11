import { useQuery } from "@tanstack/react-query";
import { Skill, QuizAttempt } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const { data: skills = [], isLoading: skillsLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery<(QuizAttempt & { skill: Skill })[]>({
    queryKey: ["/api/quiz-attempts/my-attempts"],
  });

  const totalQuizzes = attempts.length;
  const avgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / attempts.length)
    : 0;
  const recentAttempts = attempts.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">QuizMaster</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, <span className="font-medium text-foreground">{user?.username}</span></span>
              <ThemeToggle />
              <Button variant="outline" onClick={logout} data-testid="button-logout">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Dashboard</h2>
            <p className="text-muted-foreground">Track your progress and start new quizzes</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-quizzes">{totalQuizzes}</div>
                <p className="text-xs text-muted-foreground mt-1">Total attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-avg-score">{avgScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Available</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-skills-count">{skills.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to practice</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Skills */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Start a Quiz</h3>
            {skillsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-3"></div>
                      <div className="h-9 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : skills.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No quizzes available yet. Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => {
                  const skillAttempts = attempts.filter(a => a.skillId === skill.id);
                  const skillAvg = skillAttempts.length > 0
                    ? Math.round(skillAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions * 100), 0) / skillAttempts.length)
                    : null;

                  return (
                    <Card key={skill.id} data-testid={`card-skill-${skill.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{skill.name}</CardTitle>
                          {skillAvg !== null && (
                            <Badge variant="secondary">{skillAvg}% avg</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {skill.description || "Test your knowledge in this area"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/quiz/${skill.id}`}>
                          <Button className="w-full" data-testid={`button-start-quiz-${skill.id}`}>
                            Start Quiz
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Attempts */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
            {attemptsLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : recentAttempts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No quiz attempts yet. Start your first quiz above!</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    {recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between" data-testid={`row-attempt-${attempt.id}`}>
                        <div className="flex-1">
                          <p className="font-medium">{attempt.skill.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={attempt.score / attempt.totalQuestions >= 0.7 ? "default" : "secondary"}>
                          {attempt.score}/{attempt.totalQuestions} ({Math.round(attempt.score / attempt.totalQuestions * 100)}%)
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-center">
            <Link href="/performance">
              <Button variant="outline" size="lg" data-testid="button-view-performance">
                View Full Performance Report
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
