'use client'

import React, { useState, useEffect } from 'react';
import { FileText, ImageIcon, Book, Download, Eye, Search, Filter, Folder, FileIcon, BookOpen, HelpCircle, Shield, Lock, Search as SearchIcon, Key } from 'lucide-react';

interface ResourceItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'markdown' | 'text' | 'document' | 'script';
  category: 'guide' | 'evidence' | 'reference' | 'challenge' | 'tools';
  size?: string;
  description: string;
  path: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample resources data
  useEffect(() => {
    const sampleResources: ResourceItem[] = [
      {
        id: '1',
        name: 'CTF Getting Started Guide',
        type: 'markdown',
        category: 'guide',
        description: 'Complete beginner\'s guide to CTF challenges with room overviews and scoring system',
        path: '/resources/guides/ctf-getting-started.md',
        tags: ['beginner', 'overview', 'rules'],
        difficulty: 'easy'
      },
      {
        id: '2',
        name: 'Password Security Reference',
        type: 'markdown',
        category: 'reference',
        description: 'Comprehensive guide to password attacks, hash functions, and security best practices',
        path: '/resources/guides/password-security-reference.md',
        tags: ['passwords', 'hashes', 'security'],
        difficulty: 'medium'
      },
      {
        id: '3',
        name: 'OSINT Investigation Toolkit',
        type: 'markdown',
        category: 'reference',
        description: 'Open Source Intelligence gathering techniques, tools, and legal considerations',
        path: '/resources/guides/osint-investigation-toolkit.md',
        tags: ['osint', 'investigation', 'tools'],
        difficulty: 'medium'
      },
      {
        id: '4',
        name: 'Cryptography Fundamentals',
        type: 'markdown',
        category: 'reference',
        description: 'Classical and modern cryptography concepts with CTF-specific tips and tools',
        path: '/resources/guides/cryptography-fundamentals.md',
        tags: ['crypto', 'ciphers', 'encoding'],
        difficulty: 'hard'
      },
      {
        id: '5',
        name: 'Network Security Cheat Sheet',
        type: 'markdown',
        category: 'reference',
        description: 'Network ports, scanning commands, security tools, and common attack vectors',
        path: '/resources/guides/network-security-cheat-sheet.md',
        tags: ['network', 'ports', 'scanning'],
        difficulty: 'medium'
      },
      {
        id: '6',
        name: 'Security Incident Report',
        type: 'text',
        category: 'evidence',
        description: 'Confidential report detailing the campus security breach - investigate for clues!',
        path: '/resources/documents/security-incident-report.txt',
        tags: ['incident', 'breach', 'investigation'],
        difficulty: 'easy'
      },
      {
        id: '7',
        name: 'Digital Forensics Evidence Log',
        type: 'markdown',
        category: 'evidence',
        description: 'Detailed log of collected digital evidence from the security investigation',
        path: '/resources/documents/evidence-log.md',
        tags: ['forensics', 'evidence', 'investigation'],
        difficulty: 'medium'
      },
      {
        id: '8',
        name: 'Personnel Investigation - Dr. Morgan',
        type: 'text',
        category: 'evidence',
        description: 'Classified personnel security investigation file - contains sensitive information',
        path: '/resources/documents/personnel-investigation-morgan.txt',
        tags: ['personnel', 'classified', 'investigation'],
        difficulty: 'medium'
      },
      {
        id: '9',
        name: 'Social Media Intelligence Report',
        type: 'markdown',
        category: 'evidence',
        description: 'OSINT analysis of social media activities related to the security breach',
        path: '/resources/documents/social-media-intelligence.md',
        tags: ['osint', 'social-media', 'intelligence'],
        difficulty: 'hard'
      },
      {
        id: '10',
        name: 'Team Strategy Notes',
        type: 'markdown',
        category: 'evidence',
        description: 'Internal team meeting notes with investigation progress and action items',
        path: '/resources/documents/team-strategy-notes.md',
        tags: ['strategy', 'progress', 'timeline'],
        difficulty: 'easy'
      },
      {
        id: '11',
        name: 'CTF Toolkit Commands',
        type: 'script',
        category: 'tools',
        description: 'Handy reference script with common CTF commands and investigation tools',
        path: '/resources/documents/ctf-toolkit-commands.sh',
        tags: ['commands', 'tools', 'reference'],
        difficulty: 'medium'
      }
    ];

    setResources(sampleResources);
    setFilteredResources(sampleResources);
  }, []);

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, selectedType, resources]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-blue-500" />;
      case 'markdown':
        return <BookOpen className="w-6 h-6 text-green-500" />;
      case 'text':
        return <FileIcon className="w-6 h-6 text-gray-500" />;
      case 'script':
        return <Key className="w-6 h-6 text-purple-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide':
        return <Book className="w-5 h-5 text-blue-500" />;
      case 'evidence':
        return <Search className="w-5 h-5 text-purple-500" />;
      case 'reference':
        return <HelpCircle className="w-5 h-5 text-green-500" />;
      case 'challenge':
        return <Shield className="w-5 h-5 text-orange-500" />;
      case 'tools':
        return <Key className="w-5 h-5 text-purple-600" />;
      default:
        return <Folder className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewResource = (resource: ResourceItem) => {
    // Open resource in new tab/window
    window.open(resource.path, '_blank');
  };

  const handleDownloadResource = (resource: ResourceItem) => {
    // Create download link
    const link = document.createElement('a');
    link.href = resource.path;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Folder className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">CTF Resources Hub</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Access all CTF guides, evidence files, reference materials, and investigation documents. 
            Everything you need to solve the cybersecurity challenges and track down the campus hacker!
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="guide">Guides</option>
                <option value="evidence">Evidence</option>
                <option value="reference">Reference</option>
                <option value="challenge">Challenges</option>
                <option value="tools">Tools</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by file type"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="markdown">Markdown</option>
                <option value="pdf">PDF</option>
                <option value="text">Text</option>
                <option value="script">Scripts</option>
                <option value="image">Images</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'} rounded-l-lg`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'} rounded-r-lg`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Guides</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {resources.filter(r => r.category === 'guide').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Evidence</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {resources.filter(r => r.category === 'evidence').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">References</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {resources.filter(r => r.category === 'reference').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Tools</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {resources.filter(r => r.category === 'tools').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Total Files</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
          </div>
        </div>

        {/* Resources Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(resource.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{resource.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getCategoryIcon(resource.category)}
                          <span className="text-sm text-gray-500 capitalize">{resource.category}</span>
                        </div>
                      </div>
                    </div>
                    {resource.difficulty && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewResource(resource)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadResource(resource)}
                      aria-label={`Download ${resource.name}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getFileIcon(resource.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                          {resource.difficulty && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(resource.difficulty)}`}>
                              {resource.difficulty}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(resource.category)}
                            <span className="text-sm text-gray-500 capitalize">{resource.category}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{resource.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleViewResource(resource)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadResource(resource)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 mb-3">
                If you can&apos;t find what you&apos;re looking for or need assistance with any resources, don&apos;t hesitate to ask for help!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">💡 Check the guides first</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">🔍 Use search and filters</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">📝 Read evidence carefully</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">🏆 Start with easy challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
