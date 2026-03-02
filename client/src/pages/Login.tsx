/**
 * Login Page - Editorial Warmth Style
 * Full-screen login page with brand identity
 */
import { getLoginUrl } from '@/const';
import { Sparkles, ArrowRight, Zap, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-orange">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                AI Pulse
              </h1>
              <p className="text-xs text-white/70 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                前沿资讯聚合
              </p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            追踪AI领域<br />
            <span className="text-white/90">最前沿的声音</span>
          </h2>

          <p className="text-base text-white/80 leading-relaxed mb-10 max-w-md">
            聚合40+位AI领域顶尖人物的推特动态，通过Grok AI深度解读，每12小时自动更新。
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">大V动态追踪</p>
                <p className="text-xs text-white/60">覆盖OpenAI、DeepMind、Anthropic等顶尖团队</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">学术前沿速递</p>
                <p className="text-xs text-white/60">最新AI论文、开源项目深度解读</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">个人收藏夹</p>
                <p className="text-xs text-white/60">收藏感兴趣的内容，构建个人AI知识库</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                AI Pulse
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                前沿资讯聚合
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            欢迎回来
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            登录以访问AI前沿资讯和个人收藏夹
          </p>

          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-brand-orange hover:bg-brand-orange-dark text-white font-medium text-sm rounded-lg shadow-warm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>使用 Manus 账号登录</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            登录即表示您同意我们的服务条款和隐私政策
          </p>

          {/* Decorative footer */}
          <div className="mt-16 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center" style={{ fontFamily: 'var(--font-mono)' }}>
              Powered by Grok AI · 每12小时自动更新
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
