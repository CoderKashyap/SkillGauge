import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Question, Skill } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
// import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:skillId");
  // const [, setLocation] = useLocation();
  // const { user } = useAuth();
  const { toast } = useToast();
  const skillId = params?.skillId;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: skill } = useQuery<Skill>({
    queryKey: ["/api/skills", skillId],
    enabled: !!skillId,
  });

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/by-skill", skillId],
    enabled: !!skillId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (quizData: any) => {
      return apiRequest("POST", "/api/quiz-attempts", quizData);
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      toast({
        title: "Quiz completed!",
        description: `You scored ${data.score}/${data.totalQuestions}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // console.log("currentQuestion", currentQuestion);


  const handleAnswerSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const quizAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || "",
    }));

    submitQuizMutation.mutate({
      skillId,
      answers: quizAnswers,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-6">No questions available for this skill yet.</p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dashboard">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && results) {
    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center space-y-4">
            {passed ? (
              <CheckCircle2 className="h-16 w-16 mx-auto text-chart-2" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-chart-3" />
            )}
            <CardTitle className="text-3xl">{passed ? "Great Job!" : "Keep Practicing!"}</CardTitle>
            <CardDescription>
              You completed the {skill?.name} quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2" data-testid="text-final-score">
                {percentage}%
              </div>
              <p className="text-muted-foreground">
                {results.score} out of {results.totalQuestions} correct
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full" data-testid="button-back-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/performance" className="flex-1">
                <Button className="w-full" data-testid="button-view-performance">
                  View Performance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-exit-quiz">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Quiz
            </Button>
          </Link>
          <Badge variant="secondary" className="text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{currentQuestion.questionText}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{skill?.name}</Badge>
                  <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
              {/* {currentQuestion?.options && JSON.parse(currentQuestion.options).map((option, index) => ( */}
              {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 border rounded-lg p-4 hover-elevate active-elevate-2"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      data-testid={`radio-option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
            </RadioGroup>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                data-testid="button-previous"
              >
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length || submitQuizMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-quiz"
                >
                  {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className="flex-1"
                  data-testid="button-next"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
