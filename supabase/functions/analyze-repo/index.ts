import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RepoAnalysis {
  name: string
  framework: string
  language: string
  hasEnvFile: boolean
  envVarsNeeded: string[]
  buildStatus: "pending" | "building" | "success" | "error"
  previewUrl?: string
  files?: any[]
}

async function analyzeGitHubRepo(repoUrl: string): Promise<RepoAnalysis> {
  try {
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) throw new Error('Invalid GitHub URL')
    
    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')
    
    // Fetch repository info from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`)
    if (!repoResponse.ok) throw new Error('Repository not found')
    
    const repoData = await repoResponse.json()
    
    // Fetch repository contents
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`)
    const contents = await contentsResponse.json()
    
    // Detect framework and language
    const packageJsonFile = contents.find((file: any) => file.name === 'package.json')
    const requirementsFile = contents.find((file: any) => file.name === 'requirements.txt')
    const dockerFile = contents.find((file: any) => file.name === 'Dockerfile')
    const envExampleFile = contents.find((file: any) => file.name === '.env.example')
    const envFile = contents.find((file: any) => file.name === '.env')
    
    let framework = 'Unknown'
    let language = repoData.language || 'Unknown'
    let envVarsNeeded: string[] = []
    
    // Detect framework
    if (packageJsonFile) {
      const packageResponse = await fetch(packageJsonFile.download_url)
      const packageJson = await packageResponse.json()
      
      if (packageJson.dependencies) {
        if (packageJson.dependencies.react || packageJson.dependencies.next) {
          framework = packageJson.dependencies.next ? 'Next.js' : 'React'
        } else if (packageJson.dependencies.vue) {
          framework = 'Vue.js'
        } else if (packageJson.dependencies.express) {
          framework = 'Express.js'
        } else if (packageJson.dependencies.svelte) {
          framework = 'Svelte'
        }
      }
      language = 'TypeScript'
    } else if (requirementsFile) {
      framework = 'Python'
      language = 'Python'
    } else if (dockerFile) {
      framework = 'Docker'
    }
    
    // Extract environment variables from .env.example
    if (envExampleFile) {
      const envResponse = await fetch(envExampleFile.download_url)
      const envContent = await envResponse.text()
      const envLines = envContent.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      )
      envVarsNeeded = envLines.map(line => line.split('=')[0].trim())
    }
    
    // Generate preview URL (mock for now)
    const previewId = Math.random().toString(36).substring(7)
    const previewUrl = `https://preview.codeunbox.dev/${previewId}`
    
    return {
      name: cleanRepo,
      framework,
      language,
      hasEnvFile: !!envFile,
      envVarsNeeded,
      buildStatus: "success",
      previewUrl,
      files: contents.slice(0, 10) // Return first 10 files for preview
    }
  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { repoUrl } = await req.json()
    
    if (!repoUrl) {
      return new Response(
        JSON.stringify({ error: 'Repository URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Analyzing repository:', repoUrl)
    const analysis = await analyzeGitHubRepo(repoUrl)
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})