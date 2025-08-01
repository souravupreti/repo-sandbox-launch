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
    // Extract owner and repo from GitHub URL - handle both .git and non-.git URLs
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/)
    if (!match) throw new Error('Invalid GitHub URL format')
    
    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')
    
    console.log(`Fetching repo info for ${owner}/${cleanRepo}`)
    
    // Fetch repository info from GitHub API with better error handling
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers: {
        'User-Agent': 'CodeUnbox/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!repoResponse.ok) {
      const errorText = await repoResponse.text()
      console.error(`GitHub API error: ${repoResponse.status} - ${errorText}`)
      throw new Error(`Repository not accessible: ${repoResponse.status === 404 ? 'Not found or private' : 'API error'}`)
    }
    
    const repoData = await repoResponse.json()
    
    
    // Fetch repository contents with better error handling
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`, {
      headers: {
        'User-Agent': 'CodeUnbox/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!contentsResponse.ok) {
      console.error(`Contents API error: ${contentsResponse.status}`)
      // If we can't get contents, still proceed with basic repo info
    }
    
    const contents = contentsResponse.ok ? await contentsResponse.json() : []
    
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
      try {
        const packageResponse = await fetch(packageJsonFile.download_url, {
          headers: {
            'User-Agent': 'CodeUnbox/1.0',
            'Accept': 'application/vnd.github.v3+json'
          }
        })
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
      } catch (error) {
        console.error('Error parsing package.json:', error)
        framework = 'Node.js'
      }
    } else {
      // Check for common web files if no package.json
      const htmlFiles = contents.filter((file: any) => file.name.endsWith('.html'))
      const jsFiles = contents.filter((file: any) => file.name.endsWith('.js'))
      const cssFiles = contents.filter((file: any) => file.name.endsWith('.css'))
      
      if (htmlFiles.length > 0 || jsFiles.length > 0 || cssFiles.length > 0) {
        framework = 'Static Website'
        language = 'JavaScript'
      }
    }
    
    // Extract environment variables from .env.example
    if (envExampleFile) {
      try {
        const envResponse = await fetch(envExampleFile.download_url, {
          headers: {
            'User-Agent': 'CodeUnbox/1.0'
          }
        })
        const envContent = await envResponse.text()
        const envLines = envContent.split('\n').filter(line => 
          line.trim() && !line.startsWith('#') && line.includes('=')
        )
        envVarsNeeded = envLines.map(line => line.split('=')[0].trim())
      } catch (error) {
        console.error('Error parsing .env.example:', error)
      }
    }
    
    // Generate multiple preview options for better reliability
    const previewOptions = []
    
    // For React/Next.js/Vue projects, provide multiple options
    if (framework !== 'Unknown' && framework !== 'Static Website') {
      previewOptions.push({
        name: 'CodeSandbox',
        url: `https://codesandbox.io/s/github/${owner}/${cleanRepo}`,
        primary: true
      })
      previewOptions.push({
        name: 'StackBlitz',
        url: `https://stackblitz.com/github/${owner}/${cleanRepo}`,
        primary: false
      })
      previewOptions.push({
        name: 'Gitpod',
        url: `https://gitpod.io/#https://github.com/${owner}/${cleanRepo}`,
        primary: false
      })
    } 
    // For static websites, provide multiple hosting options
    else if (framework === 'Static Website') {
      previewOptions.push({
        name: 'GitHub Pages',
        url: `https://${owner}.github.io/${cleanRepo}`,
        primary: true
      })
      previewOptions.push({
        name: 'Netlify Drop',
        url: `https://app.netlify.com/drop`,
        primary: false
      })
      previewOptions.push({
        name: 'Surge.sh',
        url: `https://surge.sh`,
        primary: false
      })
    }
    
    // Use primary preview URL
    const previewUrl = previewOptions.find(option => option.primary)?.url
    
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