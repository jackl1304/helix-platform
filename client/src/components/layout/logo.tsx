import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  showSubtext?: boolean;
  className?: string;
  linkTo?: string;
}

export function Logo({ 
  size = "medium", 
  showText = true, 
  showSubtext = false, 
  className,
  linkTo = "/" 
}: LogoProps) {
  const sizeClasses = {
    small: "h-24 w-24",
    medium: "h-36 w-36", 
    large: "h-48 w-48"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  const content = (
    <div className={cn("flex items-center", className)}>
      {/* HELIX LOGO - IMMER SICHTBAR! */}
      <div className={cn(sizeClasses[size], "flex-shrink-0 relative")}>
        {/* Helix Logo - Verwende absoluten Pfad für Development und Production */}
        <img 
          src="/helix-logo-final.svg"
          alt="Helix DNA Logo by Deltaways" 
          className="w-full h-full object-contain rounded-lg"
          style={{ 
            display: 'block', 
            minWidth: '40px', 
            minHeight: '40px',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 10,
            position: 'relative',
            visibility: 'visible',
            opacity: 1
          }}
          onError={(e) => {
            // Versuche JPG als Fallback
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('.jpg')) {
              target.src = '/helix-logo-final.jpg';
              return;
            }
            // Wenn beide fehlschlagen, zeige Text-Fallback
            console.error('❌ Logo konnte nicht geladen werden:', target.src);
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.logo-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
          onLoad={(e) => {
            console.log('✅ Helix Logo erfolgreich geladen!');
            const target = e.target as HTMLImageElement;
            console.log('📏 Logo Größe:', target.clientWidth, 'x', target.clientHeight);
          }}
        />
        
        {/* Text-Fallback (nur wenn Bild fehlt) */}
        <div 
          className="logo-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl rounded-lg"
          style={{ display: 'none', zIndex: 5 }}
        >
          HELIX
        </div>
      </div>
      
      {showText && (
        <div className="ml-3">
          <h1 className={cn(
            "font-bold text-gray-900 dark:text-gray-100",
            textSizeClasses[size]
          )}>
            Helix
          </h1>
          {showSubtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Regulatory Intelligence
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo}>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          {content}
        </div>
      </Link>
    );
  }

  return content;
}

// Preset logo components for common use cases
export function HeaderLogo() {
  return (
    <Logo 
      size="medium" 
      showText={false} 
      showSubtext={false}
      className="hover:opacity-80 transition-opacity"
      linkTo=""
    />
  );
}

export function SidebarLogo() {
  return (
    <Logo 
      size="medium" 
      showText={false} 
      showSubtext={false}
      className="max-w-[180px] max-h-[180px]"
      linkTo=""
    />
  );
}

export function CompactLogo() {
  return (
    <Logo 
      size="small" 
      showText={true} 
      showSubtext={false}
    />
  );
}

export function FullLogo() {
  return (
    <Logo 
      size="large" 
      showText={true} 
      showSubtext={true}
      className="text-center"
    />
  );
}