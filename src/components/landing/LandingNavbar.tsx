import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContactDialog } from './ContactDialog';
import { cn } from '@/lib/utils';

interface LandingNavbarProps {
  className?: string;
}

export function LandingNavbar({ className }: LandingNavbarProps) {
  return (
    <nav className={cn('bg-[#141414] text-white px-4 py-4 sticky top-0 z-50', className)}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
          DecisionLogr
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="hover:text-primary transition-colors">
            Testimonials
          </a>
          <ContactDialog 
            trigger={
              <button className="hover:text-primary transition-colors">
                Contact
              </button>
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="hidden md:flex">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
