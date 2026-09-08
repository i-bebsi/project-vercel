import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ucpkzfsjjzunhbhvaqva.supabase.co"
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcGt6ZnNqanp1bmhiaHZhcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg1Nzc4NSwiZXhwIjoyMTA0NDMzNzg1fQ.dAZ2iPzKTKuwX3VoQVArmoJLw8oyCQuf67rnXYnvLMc"

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  // Step 1: Check existing users
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  console.log("Existing users:", users?.users?.length || 0)
  
  if (users?.users?.length > 0) {
    console.log("Users found:")
    users.users.forEach(u => console.log(`  - ${u.email}`))
  }

  // Step 2: Try to create user with retry
  console.log("\nTrying to create user...")
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@kanban.com",
    password: "admin123456",
    email_confirm: true,
    user_metadata: { full_name: "Admin Kanban" }
  })

  if (error) {
    console.error("Create user error:", error.message)
    console.error("Error code:", error.code)
    console.error("Error status:", error.status)
  } else {
    console.log("User created successfully:", data.user.email)
  }
}

main().catch(console.error)
