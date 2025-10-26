"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, FileText, Search, Trash2, CheckCircle, XCircle, GraduationCap, Building2 } from "lucide-react"
import {
  getDirectorStats,
  getUniversityDocuments,
  getUniversityProfessors,
  moderateUniversityDocument,
  deleteUniversityDocument,
} from "@/lib/actions/director"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import { AuthNav } from "@/components/navigation/auth-nav"
import Link from "next/link"

export function DirectorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [statsResult, docsResult, profsResult] = await Promise.all([
      getDirectorStats(),
      getUniversityDocuments(),
      getUniversityProfessors(),
    ])

    if (statsResult.success) setStats(statsResult.data)
    if (docsResult.success) setDocuments(docsResult.data)
    if (profsResult.success) setProfessors(profsResult.data)
  }

  const handleModerateDocument = async (docId: string, approved: boolean) => {
    const result = await moderateUniversityDocument(docId, approved)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Tem certeza que deseja eliminar este documento?")) return

    const result = await deleteUniversityDocument(docId)
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: result.message })
      loadData()
    }
  }

  const filteredDocuments = documents.filter((doc) => doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()))

  const pendingDocs = documents.filter((doc) => !doc.aprovado)
  const studentDocs = documents.filter((doc) => doc.autor_id?.tipo_usuario === "aluno")

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="font-serif font-black text-3xl text-foreground">Dashboard do Diretor</h1>
          </div>
          <p className="text-muted-foreground">Gestão da universidade e aprovação de documentos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="professors">Professores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Professores</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProfessors || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisar documentos pendentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pendingDocs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum documento pendente</p>
                  ) : (
                    pendingDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{doc.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Por: {doc.autor_id?.nome_completo} ({doc.autor_id?.tipo_usuario})
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">Pendente</Badge>
                            {doc.categoria && <Badge variant="outline">{doc.categoria}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/browse/${doc.id}`}>Ver</Link>
                          </Button>
                          <Button size="sm" variant="default" onClick={() => handleModerateDocument(doc.id, true)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleModerateDocument(doc.id, false)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Por: {doc.autor_id?.nome_completo} • {doc.downloads || 0} downloads
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={doc.aprovado ? "default" : "secondary"}>
                            {doc.aprovado ? "Aprovado" : "Pendente"}
                          </Badge>
                          {doc.categoria && <Badge variant="outline">{doc.categoria}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/browse/${doc.id}`}>Ver</Link>
                        </Button>
                        {doc.autor_id?.tipo_usuario === "aluno" && (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professores da Universidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professors.map((prof) => (
                    <div key={prof.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={prof.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{prof.nome_completo?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{prof.nome_completo}</h3>
                          <p className="text-sm text-muted-foreground">{prof.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">Professor</Badge>
                            <Badge variant="secondary">Nível {prof.nivel}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{prof.pontos} pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
