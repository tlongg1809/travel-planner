import React, { useState, useEffect } from 'react';
import PlaceCard from '../../components/Home/PlaceCard';
import { getCategories } from "../../services/categoryService";
import { getPlaces } from "../../services/placeService";
import Layout from "../../components/Layout/Layout";

const DISTRICTS = ['Ninh Kiều', 'Cái Răng', 'Phong Điền', 'Bình Thủy'];

export default function Explore() {
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // States lọc
  const [selectedCity, setSelectedCity] = useState('Cần Thơ');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Lấy danh sách danh mục từ DB
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh mục:", err);
        setCategories([]);
      });
  }, []);

  // Lấy danh sách địa điểm khi thay đổi bộ lọc
  useEffect(() => {
    fetchPlaces();
  }, [selectedCity, selectedDistrict, selectedCategory, sortBy]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await getPlaces({
        tinhthanh: selectedCity,
        quanhuyen: selectedDistrict,
        danhmucid: selectedCategory,
        search: searchQuery,
        sort: sortBy,
      });

      if (Array.isArray(res.data)) {
        setPlaces(res.data);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Lỗi kết nối API:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Bộ lọc tìm kiếm */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔍</span> Bộ lọc tìm kiếm
          </h2>

          {/* Hàng 1: Tỉnh/Thành & Quận/Huyện */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Cần Thơ">Cần Thơ</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tất cả quận/huyện</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

          {/* Hàng 2: Từ khóa & Danh mục DB */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Tìm theo tên địa điểm, địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-medium"
              >
                Tìm kiếm
              </button>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tất cả danh mục</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.tendanhmuc}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Lọc nhanh danh mục bằng Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === '' ? 'bg-slate-900 text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Tất cả
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                String(selectedCategory) === String(cat.id) ? 'bg-slate-900 text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {cat.tendanhmuc}
            </button>
          ))}
        </div>

        {/* Danh sách địa điểm */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : (places || []).length === 0 ? (
          <div className="text-center py-10 text-gray-500">Không tìm thấy địa điểm phù hợp.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(places || []).map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}