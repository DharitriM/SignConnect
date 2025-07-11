import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Zap, Shield, Globe, Code } from "lucide-react";

const technologies = [
  {
    name: "WebRTC",
    description: "Peer-to-peer video calling",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "TensorFlow.js",
    description: "Client-side AI processing",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "MediaPipe",
    description: "Hand tracking and detection",
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Socket.io",
    description: "Real-time signaling",
    icon: <Code className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Next.js",
    description: "Full-stack React framework",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-gray-100 text-gray-800",
  },
  {
    name: "MongoDB",
    description: "User data and call history",
    icon: <Users className="h-6 w-6" />,
    color: "bg-green-100 text-green-800",
  },
];

const features = [
  {
    title: "Real-time Translation",
    description:
      "AI-powered sign language to text conversion with millisecond latency",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
  },
  {
    title: "Privacy First",
    description:
      "Peer-to-peer connections ensure your conversations stay completely private",
    icon: <Shield className="h-8 w-8 text-green-500" />,
  },
  {
    title: "No Downloads",
    description:
      "Works directly in your browser without any software installation",
    icon: <Globe className="h-8 w-8 text-blue-500" />,
  },
  {
    title: "Accessible Design",
    description:
      "Built with accessibility in mind for users with hearing impairments",
    icon: <Heart className="h-8 w-8 text-red-500" />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-ring mb-4">
              About SignConnect
            </h1>
            <p className="text-xl text-gray-400 mx-auto">
              Technology that breaks communication barriers and makes the world
              more inclusive
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Heart className="h-8 w-8" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-accent rounded-b-lg">
              <p className="text-lg text-gray-500 leading-relaxed mb-6">
                SignConnect aims to make communication accessible for everyone
                by providing real-time sign language interpretation in video
                calls. We believe that technology should bridge gaps, not create
                them.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Our platform empowers the deaf and hard-of-hearing community to
                communicate naturally and effortlessly with anyone, anywhere in
                the world. By combining cutting-edge AI with intuitive design,
                we're building a more inclusive digital future.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ring mb-8 text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow bg-accent"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ring mb-8 text-center">
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow bg-accent"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {tech.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{tech.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {tech.description}
                    </p>
                    <Badge className={tech.color}>{tech.name}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Impact Section */}
          <Card className="mb-12 bg-gradient-to-r from-blue-100 to-purple-100 border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3 text-blue-600">
                <Users className="h-8 w-8" />
                Making an Impact
              </CardTitle>
              <CardDescription className="text-lg text-gray-500">
                Building bridges in the deaf and hard-of-hearing community
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    466M+
                  </div>
                  <p className="text-gray-400">
                    People worldwide with hearing loss
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    70M+
                  </div>
                  <p className="text-gray-400">
                    Deaf people who use sign language
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    100%
                  </div>
                  <p className="text-gray-400">
                    Free and accessible to everyone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card className="border-0 shadow-lg bg-accent">
            <CardHeader>
              <CardTitle className="text-2xl text-ring">
                🙏 Credits & Acknowledgments
              </CardTitle>
              <CardDescription>
                Standing on the shoulders of giants
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="space-y-4 text-gray-400 list-disc ml-5">
                <li>
                  <strong>MediaPipe team at Google</strong> for revolutionary
                  hand tracking technology
                </li>
                <li>
                  <strong>TensorFlow.js community</strong> for making machine
                  learning accessible in browsers
                </li>
                <li>
                  <strong>WebRTC contributors</strong> for enabling peer-to-peer
                  communication standards
                </li>
                <li>
                  <strong>Open-source sign language datasets</strong> and
                  research contributors
                </li>
                <li>
                  <strong>Accessibility advocates</strong> and the deaf
                  community for guidance and feedback
                </li>
                <li>
                  <strong>MongoDB</strong> for reliable data storage and user
                  management
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Help us make communication more inclusive. Whether you're a
                  developer, designer, or accessibility advocate, there are many
                  ways to contribute to this open-source project.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-base">
                    💻 Open Source
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-base">
                    🌍 Global Impact
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-base">
                    ♿ Accessibility First
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
