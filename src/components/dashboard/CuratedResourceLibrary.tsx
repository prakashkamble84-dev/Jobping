import React, { useState, useEffect } from 'react';
import { CareerProfile, ResourceCategory, ResourceItem } from '../../types';
import {
  getCuratedResourcesForProfile,
  getBookmarkedResourceIds,
  toggleResourceBookmark,
  getCompletedResourceIds,
  toggleResourceCompleted,
} from '../../services/resourceService';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  GraduationCap,
  Award,
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  Star,
  Users,
  Compass,
  Sparkles,
  Layers,
  FileText,
  Code2,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface CuratedResourceLibraryProps {
  profile: CareerProfile | null;
  id?: string;
  className?: string;
}

export const CuratedResourceLibrary: React.FC<CuratedResourceLibraryProps> = ({
  profile,
  id = 'curated-resource-library-section',
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('All Resources');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyRoleSpecific, setOnlyRoleSpecific] = useState<boolean>(true);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    setBookmarkedIds(getBookmarkedResourceIds());
    setCompletedIds(getCompletedResourceIds());
  }, []);

  const handleToggleBookmark = (resourceId: string, title?: string) => {
    const isNowBookmarked = toggleResourceBookmark(resourceId);
    setBookmarkedIds(getBookmarkedResourceIds());
    if (isNowBookmarked) {
      showSuccess('Saved to Bookmarks 🔖', title ? `"${title}" has been saved.` : undefined);
    } else {
      showInfo('Removed from Bookmarks', title ? `"${title}" removed from saved list.` : undefined);
    }
  };

  const handleToggleCompleted = (resourceId: string, title?: string) => {
    const isNowCompleted = toggleResourceCompleted(resourceId);
    setCompletedIds(getCompletedResourceIds());
    if (isNowCompleted) {
      showSuccess('Resource Completed! 🎓', title ? `Marked "${title}" as completed.` : undefined);
    } else {
      showInfo('Resource Progress Reset', title ? `"${title}" marked in-progress.` : undefined);
    }
  };

  const { matchedResources, roleSpecificCount, totalAvailableCount, targetJob } =
    getCuratedResourcesForProfile(profile, {
      category: selectedCategory,
      searchQuery,
      onlyRoleSpecific,
      onlyBookmarked,
    });

  const categories: { label: ResourceCategory; icon: React.FC<{ className?: string }> }[] = [
    { label: 'All Resources', icon: Layers },
    { label: 'Study Materials', icon: BookOpen },
    { label: 'Courses & Bootcamps', icon: GraduationCap },
    { label: 'Certification Guides', icon: Award },
    { label: 'Interview Kits', icon: FileText },
  ];

  const getCategoryTheme = (category: ResourceItem['category']) => {
    switch (category) {
      case 'Study Materials':
        return {
          badge: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: BookOpen,
        };
      case 'Courses & Bootcamps':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: GraduationCap,
        };
      case 'Certification Guides':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Award,
        };
      case 'Interview Kits':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: FileText,
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: Layers,
        };
    }
  };

  const getDifficultyBadge = (difficulty: ResourceItem['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPricingBadge = (pricing: ResourceItem['pricing']) => {
    switch (pricing) {
      case 'Free':
        return 'bg-emerald-600 text-white font-bold';
      case 'Free with Audit':
        return 'bg-teal-700 text-white font-bold';
      case 'Official Certification':
        return 'bg-purple-700 text-white font-bold';
      default:
        return 'bg-slate-700 text-white font-medium';
    }
  };

  return (
    <div
      id={id}
      className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Curated Learning & Growth
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Industry Resource Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hand-curated study guides, recognized bootcamps, and official certifications mapped to{' '}
            <strong className="text-indigo-900 font-bold">{targetJob}</strong>.
          </p>
        </div>

        {/* Role Toggle Switch & Bookmarks Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyRoleSpecific(!onlyRoleSpecific)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              onlyRoleSpecific
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{onlyRoleSpecific ? `Target: ${targetJob}` : 'All Job Roles'}</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              onlyBookmarked
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Saved ({bookmarkedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, topics, certs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {matchedResources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No resources found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, switching off role-specific filtering, or selecting &ldquo;All Resources&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Resources');
              setOnlyRoleSpecific(false);
              setOnlyBookmarked(false);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchedResources.map((item) => {
            const theme = getCategoryTheme(item.category);
            const CategoryIcon = theme.icon;
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isCompleted = completedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all flex flex-col justify-between p-4 relative ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Top Badges & Bookmark */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${getPricingBadge(
                          item.pricing
                        )}`}
                      >
                        {item.pricing}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(item.id, item.title)}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked ? 'fill-amber-500 text-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {item.provider}
                    </span>
                    {item.rating && (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        {item.rating}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Meta Tags (Duration, Difficulty, Learners) */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.estimatedDuration}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded border ${getDifficultyBadge(
                        item.difficulty
                      )}`}
                    >
                      {item.difficulty}
                    </span>
                    {item.learnerCount && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {item.learnerCount}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(item.id, item.title)}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                      isCompleted
                        ? 'text-emerald-700 hover:text-emerald-800'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isCompleted ? 'fill-emerald-600 text-white' : ''
                      }`}
                    />
                    <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    <span>Access Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pro-tip info banner */}
      <div className="rounded-xl p-3.5 bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Career Readiness Tip:</strong> Completing official vendor certifications (like Meta, AWS, or Google Career Certificates) or portfolio projects from The Odin Project dramatically increases recruiter response rates on LinkedIn and Naukri.
        </div>
      </div>
    </div>
  );
};
