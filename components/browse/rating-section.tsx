"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

interface RatingSectionProps {
  fileId: string
  currentRating: number
  ratingCount: number
}

const ratingBreakdown = [
  { stars: 5, count: 15, percentage: 65 },
  { stars: 4, count: 5, percentage: 22 },
  { stars: 3, count: 2, percentage: 9 },
  { stars: 2, count: 1, percentage: 4 },
  { stars: 1, count: 0, percentage: 0 },
]

export function RatingSection({ fileId, currentRating, ratingCount }: RatingSectionProps) {
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)

  const handleRating = (rating: number) => {
    setUserRating(rating)
    setHasRated(true)
    // In real app, send rating to API
    console.log("[v0] User rated file:", fileId, "with rating:", rating)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Avaliações e Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-serif font-black text-foreground mb-1">{currentRating}</div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(currentRating) ? "fill-current text-yellow-500" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{ratingCount} avaliações</div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-muted-foreground">{item.stars}</span>
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                </div>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="text-muted-foreground w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Rating */}
        {!hasRated ? (
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <h4 className="font-medium text-foreground mb-3">Avalia este recurso</h4>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRating(star)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || userRating)
                        ? "fill-current text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Clica nas estrelas para avaliar a qualidade deste recurso</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 text-secondary">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">Obrigado pela tua avaliação!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Avaliaste este recurso com {userRating} estrela{userRating !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
