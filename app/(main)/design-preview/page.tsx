"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Design Option 1: Classic Slack (Current)
const DesignOption1 = () => (
    <div className="h-[600px] w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-[240px] bg-[#3F0E40] text-white flex flex-col">
                <div className="h-[49px] flex items-center justify-between px-4 border-b border-[#5d2c5d]">
                    <h1 className="text-lg font-bold">Acme Corp</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-2 px-4">
                    <div className="mb-6">
                        <h2 className="text-[15px] font-bold text-[#bcbabc] mb-2">Channels</h2>
                        <div className="space-y-[2px]">
                            <div className="bg-[#1164A3] text-white px-2 py-1 rounded-sm text-[15px]">
                                # general
                            </div>
                            <div className="text-[#BCABBC] hover:bg-[#350D36] px-2 py-1 rounded-sm text-[15px]">
                                # random
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-[#bcbabc] mb-2">Direct Messages</h2>
                        <div className="space-y-[2px]">
                            <div className="text-[#BCABBC] hover:bg-[#350D36] px-2 py-1 rounded-sm text-[15px] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Sarah Jones
                            </div>
                            <div className="text-[#BCABBC] hover:bg-[#350D36] px-2 py-1 rounded-sm text-[15px] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Product Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="h-[49px] border-b flex items-center px-4">
                    <h2 className="text-lg font-bold text-gray-800"># general</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
                            AC
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">Alex Chen</span>
                                <span className="text-xs text-gray-500">10:05 AM</span>
                            </div>
                            <div className="bg-[#F8F8F8] px-4 py-2 rounded-2xl rounded-tl-none text-sm">
                                New design mocks uploaded to Figma.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            MG
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">Maria Garcia</span>
                                <span className="text-xs text-gray-500">10:06 AM</span>
                            </div>
                            <div className="bg-[#F8F8F8] px-4 py-2 rounded-2xl rounded-tl-none text-sm">
                                Looks great, Alex!
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t p-4">
                    <div className="bg-white border border-gray-300 rounded-lg p-3">
                        <div className="text-sm text-gray-500">Message #general</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Design Option 2: Modern Slack (Updated colors, more spacing)
const DesignOption2 = () => (
    <div className="h-[600px] w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-[260px] bg-[#2C2D30] text-white flex flex-col">
                <div className="h-[60px] flex items-center justify-between px-5 border-b border-[#3D3E42] bg-[#1D1C1D]">
                    <h1 className="text-xl font-bold">Acme Corp</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-5">
                    <div className="mb-8">
                        <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Channels</h2>
                        <div className="space-y-1">
                            <div className="bg-[#1264A3] text-white px-3 py-2 rounded-md text-sm font-medium">
                                # general
                            </div>
                            <div className="text-[#D1D5DB] hover:bg-[#3D3E42] px-3 py-2 rounded-md text-sm">
                                # random
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Direct Messages</h2>
                        <div className="space-y-1">
                            <div className="text-[#D1D5DB] hover:bg-[#3D3E42] px-3 py-2 rounded-md text-sm flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-[#2C2D30]"></div>
                                Sarah Jones
                            </div>
                            <div className="text-[#D1D5DB] hover:bg-[#3D3E42] px-3 py-2 rounded-md text-sm flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-[#2C2D30]"></div>
                                Product Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 bg-[#FFFFFF] flex flex-col">
                <div className="h-[60px] border-b border-gray-200 flex items-center px-6 bg-white">
                    <h2 className="text-xl font-bold text-gray-900"># general</h2>
                    <span className="ml-4 text-sm text-gray-500">Add a topic</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FA]">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                            AC
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-base text-gray-900">Alex Chen</span>
                                <span className="text-xs text-gray-500">10:05 AM</span>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-xl rounded-tl-sm text-sm shadow-sm border border-gray-100">
                                New design mocks uploaded to Figma.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                            MG
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-base text-gray-900">Maria Garcia</span>
                                <span className="text-xs text-gray-500">10:06 AM</span>
                            </div>
                            <div className="bg-white px-5 py-3 rounded-xl rounded-tl-sm text-sm shadow-sm border border-gray-100">
                                Looks great, Alex!
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 focus-within:border-[#1264A3] focus-within:bg-white transition-colors">
                        <div className="text-sm text-gray-400">Message #general</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Design Option 3: Compact Slack (Efficient space usage)
const DesignOption3 = () => (
    <div className="h-[600px] w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-[220px] bg-[#350D36] text-white flex flex-col">
                <div className="h-[45px] flex items-center justify-between px-3 border-b border-[#4A154B]">
                    <h1 className="text-base font-bold">Acme Corp</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-2 px-3">
                    <div className="mb-4">
                        <h2 className="text-[13px] font-semibold text-[#BCABBC] mb-1.5">Channels</h2>
                        <div className="space-y-0.5">
                            <div className="bg-[#1164A3] text-white px-2 py-1.5 rounded text-[14px]">
                                # general
                            </div>
                            <div className="text-[#BCABBC] hover:bg-[#2B0C2C] px-2 py-1.5 rounded text-[14px]">
                                # random
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[13px] font-semibold text-[#BCABBC] mb-1.5">Direct Messages</h2>
                        <div className="space-y-0.5">
                            <div className="text-[#BCABBC] hover:bg-[#2B0C2C] px-2 py-1.5 rounded text-[14px] flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                Sarah Jones
                            </div>
                            <div className="text-[#BCABBC] hover:bg-[#2B0C2C] px-2 py-1.5 rounded text-[14px] flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                Product Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="h-[45px] border-b flex items-center px-3">
                    <h2 className="text-base font-bold text-gray-800"># general</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded bg-sky-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                            AC
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-semibold text-xs">Alex Chen</span>
                                <span className="text-[10px] text-gray-500">10:05 AM</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg rounded-tl text-sm">
                                New design mocks uploaded to Figma.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                            MG
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-semibold text-xs">Maria Garcia</span>
                                <span className="text-[10px] text-gray-500">10:06 AM</span>
                            </div>
                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg rounded-tl text-sm">
                                Looks great, Alex!
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t p-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <div className="text-xs text-gray-400">Message #general</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Design Option 4: Dark Mode Slack
const DesignOption4 = () => (
    <div className="h-[600px] w-full border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-[250px] bg-[#1A1D21] text-white flex flex-col">
                <div className="h-[55px] flex items-center justify-between px-4 border-b border-[#2D2F34] bg-[#16181C]">
                    <h1 className="text-lg font-bold">Acme Corp</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-3 px-4">
                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-[#8B8E94] uppercase tracking-wider mb-2">Channels</h2>
                        <div className="space-y-1">
                            <div className="bg-[#1264A3] text-white px-3 py-2 rounded-lg text-sm font-medium">
                                # general
                            </div>
                            <div className="text-[#C1C7CD] hover:bg-[#2D2F34] px-3 py-2 rounded-lg text-sm">
                                # random
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-[#8B8E94] uppercase tracking-wider mb-2">Direct Messages</h2>
                        <div className="space-y-1">
                            <div className="text-[#C1C7CD] hover:bg-[#2D2F34] px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
                                Sarah Jones
                            </div>
                            <div className="text-[#C1C7CD] hover:bg-[#2D2F34] px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
                                Product Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 bg-[#1E2124] flex flex-col">
                <div className="h-[55px] border-b border-[#2D2F34] flex items-center px-5 bg-[#16181C]">
                    <h2 className="text-lg font-bold text-white"># general</h2>
                    <span className="ml-4 text-sm text-[#8B8E94]">Add a topic</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#1E2124]">
                    <div className="flex gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            AC
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-semibold text-sm text-white">Alex Chen</span>
                                <span className="text-xs text-[#8B8E94]">10:05 AM</span>
                            </div>
                            <div className="bg-[#2D2F34] px-4 py-2.5 rounded-xl rounded-tl-sm text-sm text-[#E4E6EA] border border-[#3A3D42]">
                                New design mocks uploaded to Figma.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            MG
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-semibold text-sm text-white">Maria Garcia</span>
                                <span className="text-xs text-[#8B8E94]">10:06 AM</span>
                            </div>
                            <div className="bg-[#2D2F34] px-4 py-2.5 rounded-xl rounded-tl-sm text-sm text-[#E4E6EA] border border-[#3A3D42]">
                                Looks great, Alex!
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#2D2F34] p-4 bg-[#16181C]">
                    <div className="bg-[#2D2F34] border border-[#3A3D42] rounded-xl p-3 focus-within:border-[#1264A3] transition-colors">
                        <div className="text-sm text-[#8B8E94]">Message #general</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default function DesignPreviewPage() {
    const [selectedDesign, setSelectedDesign] = useState<number>(1);

    const designs = [
        { id: 1, name: "Classic Slack", description: "Traditional purple sidebar, clean white chat area" },
        { id: 2, name: "Modern Slack", description: "Updated colors, more spacing, refined aesthetics" },
        { id: 3, name: "Compact Slack", description: "Efficient space usage, tighter layout" },
        { id: 4, name: "Dark Mode Slack", description: "Full dark theme throughout" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Slack Clone Design Options</h1>
                    <p className="text-gray-600">Choose your preferred design style</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {designs.map((design) => (
                        <Card
                            key={design.id}
                            className={`p-4 cursor-pointer transition-all ${
                                selectedDesign === design.id
                                    ? "ring-2 ring-blue-500 bg-blue-50"
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

                    <div className="flex justify-center">
                        {selectedDesign === 1 && <DesignOption1 />}
                        {selectedDesign === 2 && <DesignOption2 />}
                        {selectedDesign === 3 && <DesignOption3 />}
                        {selectedDesign === 4 && <DesignOption4 />}
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

