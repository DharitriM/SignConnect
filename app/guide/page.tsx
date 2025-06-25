import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Camera, Users, MessageSquare, Settings } from "lucide-react"

const steps = [
  {
    step: "1",
    title: "Allow Camera Access",
    description: "Grant permission for camera and microphone to enable video calling",
    icon: <Camera className="h-8 w-8" />,
    details: [
      "Click 'Allow' when prompted for camera access",
      "Ensure good lighting for better sign detection",
      "Position camera at eye level for optimal viewing",
    ],
  },
  {
    step: "2",
    title: "Join or Create Room",
    description: "Enter a room code or create a new room to start your call",
    icon: <Users className="h-8 w-8" />,
    details: [
      "Generate a random room code or create your own",
      "Share the room link with participants",
      "Up to 2 participants per room currently supported",
    ],
  },
  {
    step: "3",
    title: "Enable Sign Detection",
    description: "Activate the AI-powered sign language interpreter",
    icon: <MessageSquare className="h-8 w-8" />,
    details: [
      "Click the sign interpreter button during the call",
      "Keep hands visible within the camera frame",
      "Make clear, deliberate gestures for better accuracy",
    ],
  },
  {
    step: "4",
    title: "Communicate Freely",
    description: "Enjoy seamless communication with real-time translation",
    icon: <CheckCircle className="h-8 w-8" />,
    details: [
      "View translated text in the overlay panel",
      "Type messages to convert to sign language guides",
      "Use standard video call controls as needed",
    ],
  },
]

const signLanguageGuide = [
  {
    sign: "Hello",
    description: "Wave your hand with palm facing forward",
    category: "Greetings",
  },
  {
    sign: "Thank You",
    description: "Touch your chin with fingertips, then move hand forward",
    category: "Courtesy",
  },
  {
    sign: "Please",
    description: "Place palm on chest and move in circular motion",
    category: "Courtesy",
  },
  {
    sign: "Yes",
    description: "Make a fist and nod it up and down",
    category: "Responses",
  },
  {
    sign: "No",
    description: "Extend index and middle finger, then close them",
    category: "Responses",
  },
  {
    sign: "Help",
    description: "Place one hand on top of the other, lift both up",
    category: "Common",
  },
  {
    sign: "Good Morning",
    description: "Sign 'good' then 'morning' with sunrise gesture",
    category: "Greetings",
  },
  {
    sign: "How are you?",
    description: "Point to person, then make questioning gesture",
    category: "Questions",
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Use SignConnect</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to start communicating with sign language interpretation
            </p>
          </div>

          {/* Steps Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Getting Started</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.step}
                      </div>
                      <div className="text-blue-600">{step.icon}</div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-gray-600">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Settings className="h-6 w-6 text-blue-600" />
                  Pro Tips for Better Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-800">Camera Setup</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Ensure good lighting - avoid backlighting</li>
                      <li>• Keep hands within the camera frame</li>
                      <li>• Maintain steady camera position</li>
                      <li>• Use a neutral background when possible</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-purple-800">Sign Language Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Make clear, deliberate gestures</li>
                      <li>• Pause briefly between signs</li>
                      <li>• Face the camera directly</li>
                      <li>• Practice common phrases for better recognition</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign Language Reference */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Basic Sign Language Reference</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {signLanguageGuide.map((item, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{item.sign}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-4xl">🤟</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Supported Languages */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
              <CardHeader>
                <CardTitle className="text-2xl">🤟 Supported Sign Languages</CardTitle>
                <CardDescription>Currently supported sign language systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">American Sign Language (ASL)</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Full alphabet recognition</li>
                      <li>• Common phrases and greetings</li>
                      <li>• Numbers 0-10</li>
                      <li>• Basic conversation words</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Indian Sign Language (ISL)</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Basic gestures and expressions</li>
                      <li>• Common greetings</li>
                      <li>• Simple responses (yes/no)</li>
                      <li>• Essential communication signs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
