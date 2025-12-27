"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Users, ArrowRight, Check, Grid3x3 } from "lucide-react";

// Design Option 1: Card Grid Layout (Slack-style)
const DesignOption1 = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a workspace</h1>
                <p className="text-gray-600">Choose a workspace to get started, or create a new one</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Existing Workspaces */}
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            AC
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">Acme Corp</h3>
                            <p className="text-sm text-gray-500 mb-2">5 members</p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Owner</span>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400" />
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                            DT
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">Design Team</h3>
                            <p className="text-sm text-gray-500 mb-2">12 members</p>
                            <div className="flex gap-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Member</span>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400" />
                    </div>
                </Card>
            </div>

            {/* Create New Workspace */}
            <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Plus className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Create a new workspace</h3>
                        <p className="text-sm text-gray-500">Start fresh with a new workspace</p>
                    </div>
                    <ArrowRight className="text-gray-400" />
                </div>
            </Card>
        </div>
    </div>
);

// Design Option 2: List Layout (Clean & Simple)
const DesignOption2 = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome back!</h1>
                <p className="text-lg text-gray-600">Select a workspace to continue</p>
            </div>

            <div className="space-y-3 mb-6">
                <Card className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center text-white font-semibold">
                                AC
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-0.5">Acme Corp</h3>
                                <p className="text-sm text-gray-500">5 members • Owner</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                </Card>

                <Card className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white font-semibold">
                                DT
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-0.5">Design Team</h3>
                                <p className="text-sm text-gray-500">12 members • Member</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </Card>
            </div>

            <div className="border-t pt-6">
                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                    <Plus size={20} />
                    <div className="text-left">
                        <div className="font-semibold">Create new workspace</div>
                        <div className="text-sm text-gray-500 font-normal">Start a new workspace from scratch</div>
                    </div>
                </Button>
            </div>
        </div>
    </div>
);

// Design Option 3: Modal/Dialog Style (Centered)
const DesignOption3 = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg shadow-xl">
            <div className="p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your workspace</h1>
                    <p className="text-gray-600">Select an existing workspace or create a new one</p>
                </div>

                <div className="space-y-2 mb-6">
                    <button className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    AC
                                </div>
                                <div>
                                    <div className="font-semibold">Acme Corp</div>
                                    <div className="text-sm text-gray-500">5 members</div>
                                </div>
                            </div>
                            <Check className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>

                    <button className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    DT
                                </div>
                                <div>
                                    <div className="font-semibold">Design Team</div>
                                    <div className="text-sm text-gray-500">12 members</div>
                                </div>
                            </div>
                            <Check className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                </div>

                <div className="border-t pt-6">
                    <Button className="w-full" variant="outline">
                        <Plus className="mr-2" size={18} />
                        Create new workspace
                    </Button>
                </div>
            </div>
        </Card>
    </div>
);

// Design Option 4: Split Screen (Workspace List + Create Form)
const DesignOption4 = () => (
    <div className="min-h-screen bg-white flex">
        <div className="flex-1 p-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your workspaces</h1>
                <p className="text-gray-600 mb-8">Select a workspace to get started</p>

                <div className="space-y-3">
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
                                    AC
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Acme Corp</h3>
                                    <p className="text-sm text-gray-500">Owner • 5 members • 3 channels</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                Open <ArrowRight className="ml-2" size={16} />
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                                    DT
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Design Team</h3>
                                    <p className="text-sm text-gray-500">Member • 12 members • 8 channels</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                Open <ArrowRight className="ml-2" size={16} />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>

        <div className="w-96 bg-gray-50 border-l p-8">
            <h2 className="text-xl font-semibold mb-6">Create workspace</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Workspace name</label>
                    <Input placeholder="My Workspace" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Description (optional)</label>
                    <Input placeholder="What's this workspace for?" />
                </div>
                <Button className="w-full">
                    <Plus className="mr-2" size={18} />
                    Create workspace
                </Button>
            </div>
        </div>
    </div>
);

// Design Option 5: Minimalist (Slack-inspired)
const DesignOption5 = () => (
    <div className="min-h-screen bg-[#3F0E40] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-3">Select a workspace</h1>
                <p className="text-gray-300">Choose where you'd like to go</p>
            </div>

            <div className="space-y-2 mb-6">
                <button className="w-full text-left p-4 rounded bg-[#350D36] hover:bg-[#1164A3] text-white transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center text-white font-semibold">
                                AC
                            </div>
                            <div>
                                <div className="font-semibold">Acme Corp</div>
                                <div className="text-sm text-gray-300">5 members</div>
                            </div>
                        </div>
                        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </button>

                <button className="w-full text-left p-4 rounded bg-[#350D36] hover:bg-[#1164A3] text-white transition-colors group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center text-white font-semibold">
                                DT
                            </div>
                            <div>
                                <div className="font-semibold">Design Team</div>
                                <div className="text-sm text-gray-300">12 members</div>
                            </div>
                        </div>
                        <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </button>
            </div>

            <button className="w-full p-4 rounded border-2 border-dashed border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white transition-colors text-left">
                <div className="flex items-center gap-3">
                    <Plus size={20} />
                    <span className="font-medium">Create a new workspace</span>
                </div>
            </button>
        </div>
    </div>
);

export default function WorkspacePreviewPage() {
    const [selectedDesign, setSelectedDesign] = useState<number>(1);

    const designs = [
        { id: 1, name: "Card Grid Layout", description: "Slack-style card grid with hover effects" },
        { id: 2, name: "List Layout", description: "Clean and simple list view" },
        { id: 3, name: "Modal/Dialog Style", description: "Centered modal with checkmarks" },
        { id: 4, name: "Split Screen", description: "Workspace list + create form side by side" },
        { id: 5, name: "Minimalist Dark", description: "Slack-inspired dark theme" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Workspace Selection UI Options</h1>
                    <p className="text-gray-600">Choose your preferred design style</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {designs.map((design) => (
                        <Card
                            key={design.id}
                            className={`p-4 cursor-pointer transition-all ${
                                selectedDesign === design.id
                                    ? "ring-2 ring-purple-500 bg-purple-50"
                                    : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedDesign(design.id)}
                        >
                            <h3 className="font-semibold text-lg mb-1">{design.name}</h3>
                            <p className="text-sm text-gray-600">{design.description}</p>
                        </Card>
                    ))}
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {designs.find((d) => d.id === selectedDesign)?.name}
                        </h2>
                        <p className="text-gray-600">
                            {designs.find((d) => d.id === selectedDesign)?.description}
                        </p>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        {selectedDesign === 1 && <DesignOption1 />}
                        {selectedDesign === 2 && <DesignOption2 />}
                        {selectedDesign === 3 && <DesignOption3 />}
                        {selectedDesign === 4 && <DesignOption4 />}
                        {selectedDesign === 5 && <DesignOption5 />}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={() => {
                            alert(`You selected: ${designs.find((d) => d.id === selectedDesign)?.name}\n\nI'll now implement this design!`);
                        }}
                    >
                        Select This Design
                    </Button>
                </div>
            </div>
        </div>
    );
}

