'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Campaign, BlogPost } from '@/lib/supabase';

// TinyMCE 에디터를 동적으로 로드 (SSR 방지)
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-96 rounded-md">
        에디터 로딩 중...
      </div>
    ),
  }
);

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

  // 기획전 편집 상태
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    image_url: '',
    partner_link: '',
  });

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

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditForm({
      title: campaign.title,
      category: campaign.category || '',
      image_url: campaign.image_url,
      partner_link: campaign.partner_link,
    });
  };

  const handleSaveCampaign = async () => {
    if (!editingCampaign) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/campaigns/${editingCampaign.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('기획전이 수정되었습니다!');
        setEditingCampaign(null);
        fetchCampaigns();
      } else {
        alert('수정 실패: ' + result.error);
      }
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCampaign(null);
    setEditForm({
      title: '',
      category: '',
      image_url: '',
      partner_link: '',
    });
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

        // 저장 후 작성한 블로그 포스트 상세 페이지로 이동
        if (editingPost.slug) {
          window.open(`/blog/${editingPost.slug}`, '_blank');
        } else {
          // slug가 없는 경우 ID로 이동
          window.open(`/blog/${editingPost.id}`, '_blank');
        }
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
      <header className="bg-white shadow-sm border-b border-gray-200">
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
      <div className="bg-white border-b border-gray-200">
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                {/* 폼 헤더 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        새 기획전 추가
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        새로운 기획전을 등록하고 관리하세요
                      </p>
                    </div>
                  </div>
                </div>

                {/* 폼 본문 */}
                <div className="px-8 py-8">
                  <form onSubmit={handleAddCampaign} className="space-y-8">
                    {/* 기본 정보 섹션 */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          기본 정보
                        </h3>
                        <p className="text-sm text-gray-600">
                          기획전의 기본적인 정보를 입력하세요
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 제목 */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            제목 <span className="text-red-500">*</span>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                            placeholder="기획전 제목을 입력하세요"
                            required
                          />
                        </div>

                        {/* 카테고리 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            카테고리 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newCampaign.category}
                            onChange={(e) =>
                              setNewCampaign({
                                ...newCampaign,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-base"
                          >
                            <option value="일반">일반</option>
                            <option value="패션">패션</option>
                            <option value="뷰티">뷰티</option>
                            <option value="전자제품">전자제품</option>
                            <option value="홈리빙">홈리빙</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 이미지 섹션 */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          이미지 설정
                        </h3>
                        <p className="text-sm text-gray-600">
                          기획전에 표시될 이미지를 설정하세요
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          이미지 URL <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                          placeholder="https://example.com/image.jpg"
                          required
                        />

                        {/* 이미지 미리보기 */}
                        {newCampaign.image_url && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              이미지 미리보기
                            </p>
                            <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                              <Image
                                src={newCampaign.image_url}
                                alt="미리보기"
                                fill
                                className="object-cover"
                                sizes="160px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 링크 섹션 */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          링크 설정
                        </h3>
                        <p className="text-sm text-gray-600">
                          파트너스 링크를 설정하세요
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          파트너스 링크 <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                          placeholder="https://partners.coupang.com/..."
                          required
                        />
                        <p className="mt-2 text-xs text-gray-500 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          쿠팡 파트너스 링크를 입력하세요
                        </p>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>추가 중...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              <span>기획전 추가</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 기획전 편집 모달 */}
            {editingCampaign && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                  {/* 모달 헤더 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            기획전 수정
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            기획전 정보를 수정하세요
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 모달 본문 */}
                  <div className="px-8 py-8">
                    <div className="space-y-8">
                      {/* 기본 정보 섹션 */}
                      <div className="space-y-6">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            기본 정보
                          </h3>
                          <p className="text-sm text-gray-600">
                            기획전의 기본적인 정보를 수정하세요
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 제목 */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                              제목 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                              placeholder="기획전 제목을 입력하세요"
                              required
                            />
                          </div>

                          {/* 카테고리 */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                              카테고리 <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-base"
                            >
                              <option value="일반">일반</option>
                              <option value="패션">패션</option>
                              <option value="뷰티">뷰티</option>
                              <option value="전자제품">전자제품</option>
                              <option value="홈리빙">홈리빙</option>
                              <option value="식품">식품</option>
                              <option value="출산육아">출산육아</option>
                              <option value="생활용품">생활용품</option>
                              <option value="가구">가구</option>
                              <option value="주방용품">주방용품</option>
                              <option value="문구">문구</option>
                              <option value="책">책</option>
                              <option value="아동">아동</option>
                              <option value="명품">명품</option>
                              <option value="스포츠">스포츠</option>
                              <option value="기타">기타</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 이미지 섹션 */}
                      <div className="space-y-6">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            이미지 설정
                          </h3>
                          <p className="text-sm text-gray-600">
                            기획전에 표시될 이미지를 설정하세요
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            이미지 URL <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="url"
                            value={editForm.image_url}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                image_url: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                            placeholder="https://example.com/image.jpg"
                            required
                          />

                          {/* 이미지 미리보기 */}
                          {editForm.image_url && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                이미지 미리보기
                              </p>
                              <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                                <Image
                                  src={editForm.image_url}
                                  alt="미리보기"
                                  fill
                                  className="object-cover"
                                  sizes="160px"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 링크 섹션 */}
                      <div className="space-y-6">
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            링크 설정
                          </h3>
                          <p className="text-sm text-gray-600">
                            파트너스 링크를 설정하세요
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            파트너스 링크{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="url"
                            value={editForm.partner_link}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                partner_link: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-base"
                            placeholder="https://partners.coupang.com/..."
                            required
                          />
                          <p className="mt-2 text-xs text-gray-500 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            쿠팡 파트너스 링크를 입력하세요
                          </p>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCampaign}
                            disabled={loading}
                            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>저장 중...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>저장</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                              onClick={() => handleEditCampaign(campaign)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              수정
                            </button>
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

  useEffect(() => {
    if (editingPost) {
      setEditForm({
        title: editingPost.title || '',
        content: editingPost.content || '', // HTML 콘텐츠를 그대로 사용
        excerpt: editingPost.excerpt || '',
        tags: editingPost.tags || [],
        meta_description: editingPost.meta_description || '',
        is_published: editingPost.is_published ?? true,
      });
    }
  }, [editingPost]);

  const handleSave = () => {
    // WYSIWYG 에디터의 HTML 콘텐츠를 그대로 저장
    onSavePost({
      ...editForm,
      content: editForm.content, // HTML 콘텐츠를 그대로 저장
    });
  };

  // TinyMCE 에디터 설정 (React 방식)
  const editorConfig = {
    // 기본 설정
    height: 600,
    menubar: false,

    // 플러그인 (프리미엄 기능 포함)
    plugins: [
      // 코어 편집 기능
      'anchor',
      'autolink',
      'charmap',
      'codesample',
      'emoticons',
      'link',
      'lists',
      'media',
      'searchreplace',
      'table',
      'visualblocks',
      'wordcount',

      // 프리미엄 기능 (2025년 10월 2일까지 무료 체험)
      'checklist',
      'mediaembed',
      'casechange',
      'formatpainter',
      'pageembed',
      'a11ychecker',
      'tinymcespellchecker',
      'permanentpen',
      'powerpaste',
      'advtable',
      'advcode',
      'advtemplate',
      'ai',
      'uploadcare',
      'mentions',
      'tinycomments',
      'tableofcontents',
      'footnotes',
      'mergetags',
      'autocorrect',
      'typography',
      'inlinecss',
      'markdown',
      'importword',
      'exportword',
      'exportpdf',
    ],

    // 향상된 툴바
    toolbar:
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
      'link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | ' +
      'align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',

    // 스타일링
    content_style:
      'body { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; }',
    skin: 'oxide',
    content_css: 'default',

    // 브랜딩 제거
    branding: false,
    promotion: false,

    // 고급 기능 설정
    tinycomments_mode: 'embedded',
    tinycomments_author: '관리자',

    // 병합 태그 설정
    mergetags_list: [
      { value: 'campaign.title', title: '캠페인 제목' },
      { value: 'campaign.category', title: '캠페인 카테고리' },
      { value: 'current.date', title: '현재 날짜' },
    ],

    // AI Assistant 설정 (추후 구현 가능)
    ai_request: (
      request: unknown,
      respondWith: { string: (callback: () => Promise<never>) => void }
    ) => {
      respondWith.string(() =>
        Promise.reject('AI Assistant 기능은 추후 구현 예정입니다.')
      );
    },

    // Uploadcare 설정
    uploadcare_public_key: '8a183fb57904c815989c',

    // 에디터 이벤트 설정
    setup: (editor: {
      on: (event: string, callback: () => void) => void;
      getContent: () => string;
      getDoc: () => { documentElement: { lang: string } };
    }) => {
      editor.on('change', () => {
        const content = editor.getContent();
        setEditForm((prev) => ({ ...prev, content }));
      });

      // 한국어 설정
      editor.on('init', () => {
        editor.getDoc().documentElement.lang = 'ko';
      });
    },
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

            <Editor
              apiKey="h0s32a78nzh54jnf17wkmljdv3j4zbp6njvkh5gviuy1uecp"
              init={editorConfig}
              value={editForm.content}
              onEditorChange={(content) =>
                setEditForm({ ...editForm, content })
              }
            />
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
