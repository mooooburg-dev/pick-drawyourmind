'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Campaign, BlogPost } from '@/lib/supabase';

interface BlogPostWithCampaign extends BlogPost {
  campaigns?: Campaign;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'blogs'>(
    'campaigns'
  );

  // 캠페인 관련 상태
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 블로그 관련 상태
  const [blogPosts, setBlogPosts] = useState<BlogPostWithCampaign[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostWithCampaign | null>(
    null
  );

  // 새 기획전 폼 상태
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    image_url: '',
    partner_link: '',
    category: '일반',
  });

  useEffect(() => {
    // 세션에서 인증 상태 확인
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchCampaigns();
      fetchBlogPosts();

      // URL 파라미터 확인하여 탭 설정
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');

      if (tab === 'blogs') {
        setActiveTab('blogs');
      }
    }
  }, []);

  // 블로그 포스트 로딩 완료 후 URL 파라미터 처리
  useEffect(() => {
    if (isAuthenticated && blogPosts.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');

      if (editId) {
        const postToEdit = blogPosts.find((post) => post.id === editId);
        if (postToEdit) {
          setEditingPost(postToEdit);
          // URL에서 파라미터 제거 (깔끔한 URL 유지)
          const newUrl = window.location.pathname + '?tab=blogs';
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [isAuthenticated, blogPosts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 간단한 비밀번호 확인 (실제 환경에서는 더 안전한 방법 사용)
    if (password === 'admin2024!') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchCampaigns();
      fetchBlogPosts();
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const fetchBlogPosts = async () => {
    try {
      setBlogLoading(true);
      const response = await fetch('/api/admin/blog');
      const result = await response.json();

      if (result.success) {
        setBlogPosts(result.data);
      } else {
        alert('블로그 포스트 로딩 실패: ' + result.error);
      }
    } catch (error) {
      console.error('블로그 포스트 로딩 실패:', error);
      alert('블로그 포스트 로딩 중 오류가 발생했습니다.');
    } finally {
      setBlogLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // 어드민에서는 모든 캠페인(활성/비활성 포함)을 가져오기 위해 다른 엔드포인트 사용
      const response = await fetch('/api/admin/campaigns/all');
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data);
      }
    } catch (error) {
      console.error('캠페인 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampaign),
      });

      const result = await response.json();

      if (result.success) {
        alert('기획전이 추가되었습니다!');
        setNewCampaign({
          title: '',
          image_url: '',
          partner_link: '',
          category: '일반',
        });
        setShowAddForm(false);
        fetchCampaigns();
      } else {
        alert('추가 실패: ' + result.error);
      }
    } catch (error) {
      console.error('기획전 추가 실패:', error);
      alert('기획전 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('삭제되었습니다!');
        fetchCampaigns();
      } else {
        alert('삭제 실패: ' + result.error);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        fetchCampaigns();
      } else {
        alert('상태 변경 실패: ' + result.error);
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleEditBlogPost = (post: BlogPostWithCampaign) => {
    setEditingPost(post);
  };

  const handleSaveBlogPost = async (
    updatedPost: Partial<BlogPostWithCampaign>
  ) => {
    if (!editingPost) return;

    try {
      const response = await fetch(`/api/admin/blog/${editingPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });

      const result = await response.json();

      if (result.success) {
        alert('블로그 포스트가 수정되었습니다!');
        setEditingPost(null);
        fetchBlogPosts();
      } else {
        alert('수정 실패: ' + result.error);
      }
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('블로그 포스트가 삭제되었습니다!');
        fetchBlogPosts();
      } else {
        alert('삭제 실패: ' + result.error);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">관리자 로그인</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Pick 관리자</h1>
              <span className="ml-4 text-sm text-gray-500">관리 시스템</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = '/')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                홈으로
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                {showAddForm ? '취소' : '기획전 추가'}
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              기획전 관리
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              블로그 관리
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'campaigns' && (
          <>
            {/* 기획전 추가 폼 */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">새 기획전 추가</h2>
                <form onSubmit={handleAddCampaign} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목
                    </label>
                    <input
                      type="text"
                      value={newCampaign.title}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이미지 URL
                    </label>
                    <input
                      type="url"
                      value={newCampaign.image_url}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          image_url: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    {newCampaign.image_url && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">미리보기:</p>
                        <div className="relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                          <Image
                            src={newCampaign.image_url}
                            alt="미리보기"
                            fill
                            className="object-cover"
                            sizes="128px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      파트너스 링크
                    </label>
                    <input
                      type="url"
                      value={newCampaign.partner_link}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          partner_link: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://partners.coupang.com/..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select
                      value={newCampaign.category}
                      onChange={(e) =>
                        setNewCampaign({
                          ...newCampaign,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="일반">일반</option>
                      <option value="패션">패션</option>
                      <option value="뷰티">뷰티</option>
                      <option value="전자제품">전자제품</option>
                      <option value="홈리빙">홈리빙</option>
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                    >
                      {loading ? '추가 중...' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 기획전 목록 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold">
                  기획전 목록 ({campaigns.length}개)
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이미지
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          제목
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          카테고리
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          생성일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative h-12 w-12">
                              <Image
                                src={campaign.image_url}
                                alt={campaign.title}
                                fill
                                className="object-cover rounded"
                                sizes="48px"
                                onError={(e) => {
                                  // 이미지 로드 실패 시 대체 이미지 표시
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-image.jpg';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {campaign.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {campaign.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                campaign.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {campaign.is_active ? '활성' : '비활성'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(campaign.created_at).toLocaleDateString(
                              'ko-KR'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() =>
                                handleToggleActive(
                                  campaign.id,
                                  campaign.is_active
                                )
                              }
                              className={`${
                                campaign.is_active
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {campaign.is_active ? '비활성화' : '활성화'}
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-900 ml-4"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'blogs' && (
          <BlogManagement
            blogPosts={blogPosts}
            blogLoading={blogLoading}
            editingPost={editingPost}
            onEditPost={handleEditBlogPost}
            onSavePost={handleSaveBlogPost}
            onDeletePost={handleDeleteBlogPost}
            onCancelEdit={() => setEditingPost(null)}
          />
        )}
      </main>
    </div>
  );
}

// 블로그 관리 컴포넌트
function BlogManagement({
  blogPosts,
  blogLoading,
  editingPost,
  onEditPost,
  onSavePost,
  onDeletePost,
  onCancelEdit,
}: {
  blogPosts: BlogPostWithCampaign[];
  blogLoading: boolean;
  editingPost: BlogPostWithCampaign | null;
  onEditPost: (post: BlogPostWithCampaign) => void;
  onSavePost: (post: Partial<BlogPostWithCampaign>) => void;
  onDeletePost: (id: string) => void;
  onCancelEdit: () => void;
}) {
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [] as string[],
    meta_description: '',
    is_published: true,
  });
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setEditForm({
        title: editingPost.title || '',
        content: convertFromHtml(editingPost.content || ''),
        excerpt: editingPost.excerpt || '',
        tags: editingPost.tags || [],
        meta_description: editingPost.meta_description || '',
        is_published: editingPost.is_published ?? true,
      });
      setIsPreview(false); // 편집 모드로 시작
    }
  }, [editingPost]);

  const handleSave = () => {
    // 에디터 내용을 HTML로 변환하여 저장
    const htmlContent = convertToHtml(editForm.content);
    onSavePost({
      ...editForm,
      content: htmlContent,
    });
  };

  // 에디터 기능 함수들
  const insertFormatting = useCallback(
    (format: string, text?: string) => {
      const textarea = document.getElementById(
        'content-editor'
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      let replacement = '';

      switch (format) {
        case 'bold':
          replacement = `**${selectedText || text || '굵은 텍스트'}**`;
          break;
        case 'italic':
          replacement = `*${selectedText || text || '기울임 텍스트'}*`;
          break;
        case 'underline':
          replacement = `<u>${selectedText || text || '밑줄 텍스트'}</u>`;
          break;
        case 'link':
          const url = prompt('링크 URL을 입력하세요:');
          if (url) {
            replacement = `[${selectedText || '링크 텍스트'}](${url})`;
          } else {
            return;
          }
          break;
        case 'heading1':
          replacement = `# ${selectedText || '제목 1'}`;
          break;
        case 'heading2':
          replacement = `## ${selectedText || '제목 2'}`;
          break;
        case 'heading3':
          replacement = `### ${selectedText || '제목 3'}`;
          break;
        case 'list':
          replacement = `- ${selectedText || '목록 항목'}`;
          break;
        case 'code':
          replacement = `\`${selectedText || '코드'}\``;
          break;
        case 'quote':
          replacement = `> ${selectedText || '인용문'}`;
          break;
        default:
          return;
      }

      const newContent =
        textarea.value.substring(0, start) +
        replacement +
        textarea.value.substring(end);

      setEditForm({ ...editForm, content: newContent });

      // 커서 위치 조정
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + replacement.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [editForm]
  );

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            insertFormatting('bold');
            break;
          case 'i':
            e.preventDefault();
            insertFormatting('italic');
            break;
          case 'u':
            e.preventDefault();
            insertFormatting('underline');
            break;
          case 'k':
            e.preventDefault();
            insertFormatting('link');
            break;
        }
      }
    };

    if (editingPost) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editingPost, insertFormatting]);

  // HTML로 변환하는 간단한 함수 (마크다운 스타일을 HTML로)
  const convertToHtml = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  };

  // HTML을 마크다운 스타일로 변환하는 함수 (기존 콘텐츠 편집용)
  const convertFromHtml = (content: string) => {
    return content
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<h1>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1')
      .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1')
      .replace(/<li>(.*?)<\/li>/g, '- $1')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<a href="([^"]+)">(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<br>/g, '\n')
      .replace(/<br\/>/g, '\n')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>'); // 밑줄은 그대로 유지
  };

  if (blogLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (editingPost) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">블로그 포스트 수정</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발췌문
            </label>
            <textarea
              value={editForm.excerpt}
              onChange={(e) =>
                setEditForm({ ...editForm, excerpt: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              본문
            </label>

            {/* 에디터 도구바 */}
            <div className="border border-gray-300 rounded-t-md bg-gray-50 p-3 flex flex-wrap gap-2 shadow-sm">
              <button
                type="button"
                onClick={() => insertFormatting('bold')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 font-bold text-gray-700 shadow-sm transition-colors"
                title="굵게 (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('italic')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 italic text-gray-700 shadow-sm transition-colors"
                title="기울임 (Ctrl+I)"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('underline')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 underline text-gray-700 shadow-sm transition-colors"
                title="밑줄 (Ctrl+U)"
              >
                U
              </button>

              <div className="w-px bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => insertFormatting('heading1')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 font-bold text-gray-700 shadow-sm transition-colors"
                title="제목 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('heading2')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 font-bold text-gray-700 shadow-sm transition-colors"
                title="제목 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('heading3')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 font-bold text-gray-700 shadow-sm transition-colors"
                title="제목 3"
              >
                H3
              </button>

              <div className="w-px bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => insertFormatting('list')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 text-gray-700 shadow-sm transition-colors"
                title="목록"
              >
                • 목록
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('link')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 text-gray-700 shadow-sm transition-colors"
                title="링크 (Ctrl+K)"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('code')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 font-mono text-gray-700 shadow-sm transition-colors"
                title="코드"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('quote')}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 text-gray-700 shadow-sm transition-colors"
                title="인용"
              >
                &ldquo; &rdquo;
              </button>

              <div className="w-px bg-gray-300 mx-1"></div>

              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 shadow-sm transition-colors ${
                  isPreview
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700'
                }`}
                title="미리보기"
              >
                👁️ 미리보기
              </button>
            </div>

            {/* 에디터 영역 */}
            <div className="border-l border-r border-b border-gray-300 rounded-b-md">
              {isPreview ? (
                <div className="p-4 min-h-[400px] bg-white prose max-w-none text-gray-900">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: convertToHtml(editForm.content),
                    }}
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#111827',
                    }}
                  />
                </div>
              ) : (
                <textarea
                  id="content-editor"
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  rows={15}
                  className="w-full px-4 py-3 border-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900 placeholder-gray-400"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  }}
                  placeholder="여기에 글을 작성하세요... 
                  
팁: 
**굵게**, *기울임*, # 제목1, ## 제목2, ### 제목3
- 목록 항목
> 인용문
`코드`
[링크 텍스트](URL)"
                />
              )}
            </div>

            <div className="mt-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              <span
                className={`font-medium ${
                  isPreview ? 'text-blue-600' : 'text-green-600'
                }`}
              >
                {isPreview ? '📖 미리보기 모드' : '✏️ 편집 모드'}
              </span>
              <span className="text-gray-500 ml-2">
                | 저장 시 HTML로 자동 변환됩니다
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={editForm.tags.join(', ')}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  tags: e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메타 설명
            </label>
            <textarea
              value={editForm.meta_description}
              onChange={(e) =>
                setEditForm({ ...editForm, meta_description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              checked={editForm.is_published}
              onChange={(e) =>
                setEditForm({ ...editForm, is_published: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="is_published" className="text-sm text-gray-700">
              게시됨
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              저장
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">블로그 포스트 관리</h2>
        <span className="text-sm text-gray-500">
          총 {blogPosts.length}개 포스트
        </span>
      </div>

      {blogPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">등록된 블로그 포스트가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  캠페인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogPosts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {post.excerpt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {post.campaigns?.title || '연결된 캠페인 없음'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {post.campaigns?.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        post.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {post.is_published ? '게시됨' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEditPost(post)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      수정
                    </button>
                    <button
                      onClick={() =>
                        window.open(`/blog/${post.slug}`, '_blank')
                      }
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      보기
                    </button>
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
