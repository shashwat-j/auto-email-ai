import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { MdOutlineEmail } from "react-icons/md"

const redirect_uri = "http://localhost:5173/login"
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https://mail.google.com/&access_type=offline&include_granted_scopes=true&response_type=code&client_id=${import.meta.env.VITE_REACT_APP_GOOGLE_AUTH_CLIENT_ID}&redirect_uri=${redirect_uri}`

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Email Sender</CardTitle>
          <CardDescription>Login to start sending personalized emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" variant="outline" 
            onClick={(e) => {
              e.preventDefault()
              console.log("clicked")
              window.location.href=googleAuthUrl
              }}>
            <FcGoogle className="mr-2 h-4 w-4" />
            Login with Google
          </Button>
          <Button className="w-full">
            <MdOutlineEmail className="mr-2 h-4 w-4" />
            Continue with Demo Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}