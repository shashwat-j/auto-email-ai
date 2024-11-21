import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { MdAdd, MdCloudUpload, MdSettings } from "react-icons/md"
import { SiGooglesheets } from "react-icons/si"

export function MainPageComponent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white p-4 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <Button
          variant="ghost"
          className="mb-4 w-full justify-start"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </Button>
        {!sidebarCollapsed && (
          <>
            <Button className="mb-4 w-full">
              <MdAdd className="mr-2" /> New Task
            </Button>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setSelectedTask("Task 1")}
              >
                Task 1
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setSelectedTask("Task 2")}
              >
                Task 2
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="mb-6 text-3xl font-bold">
          {selectedTask || "Create New Task"}
        </h1>
        <Tabs defaultValue="data-upload" className="w-full">
          <TabsList>
            <TabsTrigger value="data-upload">Data Upload</TabsTrigger>
            <TabsTrigger value="prompt-builder">Prompt Builder</TabsTrigger>
            <TabsTrigger value="generated-emails">Generated Emails</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="data-upload">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center space-x-4">
                  <Button>
                    <MdCloudUpload className="mr-2" /> Upload CSV
                  </Button>
                  <Button variant="outline">
                    <SiGooglesheets className="mr-2" /> Connect Google Sheets
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <p>Drag and drop your CSV file here, or click to select</p>
                </div>
                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Uploaded Columns:</h3>
                  <ul className="list-inside list-disc">
                    <li>Name</li>
                    <li>Email</li>
                    <li>Company</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="prompt-builder">
            <Card>
              <CardContent className="pt-6">
                <Label htmlFor="prompt" className="mb-2 block">
                  Email Customization Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here. Use {{column_name}} for dynamic content."
                  className="mb-4 min-h-[200px]"
                />
                <div className="mb-4">
                  <h3 className="mb-2 font-semibold">Available Variables:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      {"{{name}}"}
                    </Button>
                    <Button variant="outline" size="sm">
                      {"{{email}}"}
                    </Button>
                    <Button variant="outline" size="sm">
                      {"{{company}}"}
                    </Button>
                  </div>
                </div>
                <Button>Generate Emails</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="generated-emails">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient Email</TableHead>
                      <TableHead>Preview</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>
                        Dear John, I hope this email finds you well...
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>sarah@example.com</TableCell>
                      <TableCell>
                        Hello Sarah, I wanted to reach out regarding...
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="schedule" className="mb-2 block">
                    Schedule Send
                  </Label>
                  <div className="flex space-x-4">
                    <Input type="date" id="schedule-date" />
                    <Input type="time" id="schedule-time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="throttle" className="mb-2 block">
                    Throttle (emails per minute)
                  </Label>
                  <Slider
                    id="throttle"
                    defaultValue={[30]}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Enable test mode</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}