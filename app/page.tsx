'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Campaign } from '@/lib/supabase'

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '20',
        offset: '0'
      })

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/campaigns?${params}`)
      const result = await response.json()

      if (result.success) {
        setCampaigns(result.data)
      }
    } catch (error) {
      console.error('캠페인 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const categories = [
    { value: 'all', label: '전체' },
    { value: '일반', label: '일반' },
    { value: '패션', label: '패션' },
    { value: '뷰티', label: '뷰티' },
    { value: '전자제품', label: '전자제품' },
    { value: '홈리빙', label: '홈리빙' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Pick
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                쿠팡 파트너스 기획전 갤러리
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === category.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              아직 기획전이 없습니다.
            </div>
            <p className="text-gray-400 text-sm mt-2">
              곧 새로운 기획전이 업데이트될 예정입니다.
            </p>
          </div>
        ) : (
          <>
            {/* Campaign Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                더 보기
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Pick. All rights reserved.</p>
            <p className="mt-1">쿠팡 파트너스 활동으로 일정 수수료를 받을 수 있습니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const handleClick = () => {
    // 쿠팡 파트너스 링크로 직접 이동
    window.open(campaign.partner_link, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border"
    >
      <div className="aspect-square relative">
        <Image
          src={campaign.image_url}
          alt={campaign.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
          {campaign.title}
        </h3>
        {campaign.category && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {campaign.category}
            </span>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500">
          {new Date(campaign.created_at).toLocaleDateString('ko-KR')}
        </div>
      </div>
    </div>
  )
}