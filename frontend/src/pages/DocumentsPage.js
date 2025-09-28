import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Eye, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterCategory]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    setFilteredDocuments(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'bylaws': 'Bylaws',
      'policies': 'Policies',
      'forms': 'Forms',
      'reports': 'Reports',
      'other': 'Other'
    };
    return categoryLabels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'bylaws': 'bg-red-100 text-red-800',
      'policies': 'bg-blue-100 text-blue-800',
      'forms': 'bg-green-100 text-green-800',
      'reports': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Sample documents for demo when API fails
  const sampleDocuments = [
    {
      id: '1',
      title: 'ICAA Bylaws 2025 (Current)',
      description: 'Current version of the i.c.stars Chicago Alumni Association bylaws including governance structure, membership requirements, and organizational procedures.',
      category: 'bylaws',
      version: '2.0.0',
      uploaded_at: '2025-01-15T00:00:00Z',
      file_size: 2500000,
      is_current_version: true
    },
    {
      id: '2',
      title: 'ICAA Bylaws 2019 (Archived)',
      description: 'Previous version of the ICAA bylaws for historical reference and comparison purposes.',
      category: 'bylaws',
      version: '1.0.0',
      uploaded_at: '2019-03-01T00:00:00Z',
      file_size: 1800000,
      is_current_version: false
    },
    {
      id: '3',
      title: 'Code of Conduct',
      description: 'ICAA member code of conduct outlining expected behavior, professional standards, and disciplinary procedures.',
      category: 'policies',
      version: '1.2.0',
      uploaded_at: '2024-09-15T00:00:00Z',
      file_size: 850000,
      is_current_version: true
    }
  ];

  const displayDocuments = filteredDocuments.length > 0 ? filteredDocuments : (documents.length === 0 ? sampleDocuments.filter(doc => {
    const matchesSearch = !searchTerm || doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) : []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'League Spartan' }}>
            Document Repository
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Access official ICAA documents including bylaws, policies, forms, and reports with version control and secure access.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search documents by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="documents-search"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bylaws">Bylaws</SelectItem>
                <SelectItem value="policies">Policies</SelectItem>
                <SelectItem value="forms">Forms</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Documents</h2>
            <p className="text-lg text-gray-600">
              Official ICAA documents with version control and secure access management.
            </p>
          </div>

          {displayDocuments.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {displayDocuments.map((document, index) => (
                <Card key={document.id} className="hover:shadow-xl transition-all duration-300" data-testid={`document-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(document.category)}>
                        {getCategoryLabel(document.category)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {document.is_current_version && (
                          <Badge variant="default" className="bg-green-600">Current</Badge>
                        )}
                        <Badge variant="outline">v{document.version}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{document.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {document.description}
                      </p>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-red-600" />
                          Uploaded: {formatDate(document.uploaded_at)}
                        </div>
                        {document.file_size && (
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-red-600" />
                            Size: {formatFileSize(document.file_size)}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700" 
                          onClick={() => window.open(`${API}/documents/${document.id}/file`, '_blank')}
                          data-testid={`view-document-${document.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `${API}/documents/${document.id}/file`;
                            link.download = `${document.title}.pdf`;
                            link.click();
                          }}
                          data-testid={`download-document-${document.id}`}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Documents Found</h3>
              <p className="text-gray-500">
                {documents.length === 0 
                  ? "No documents have been uploaded yet. Check back soon!"
                  : "No documents match your current search criteria."
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Document Categories Info */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Categories</h2>
            <p className="text-lg text-gray-600">
              Our documents are organized into categories for easy access and navigation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bylaws</h3>
              <p className="text-gray-600 text-sm">
                Official governance documents including current and historical versions of ICAA bylaws.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Policies</h3>
              <p className="text-gray-600 text-sm">
                Organizational policies, procedures, and guidelines for members and leadership.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Forms</h3>
              <p className="text-gray-600 text-sm">
                Downloadable forms for membership applications, event registrations, and other purposes.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reports</h3>
              <p className="text-gray-600 text-sm">
                Annual reports, financial statements, and other organizational documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Information */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Access</h2>
            <p className="text-lg text-gray-600">
              Understanding document access levels and version control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Public Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Available to all visitors and community members without login required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Member Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Restricted to active ICAA members with valid membership status.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Version Control</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Historical versions maintained for reference and transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentsPage;