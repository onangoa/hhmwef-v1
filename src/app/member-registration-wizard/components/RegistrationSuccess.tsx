import React from 'react';
import { CheckCircle2, Home, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface RegistrationSuccessProps {
  memberName: string;
  email: string;
}

export default function RegistrationSuccess({ memberName, email }: RegistrationSuccessProps) {
  return (
    <div className="text-center py-8 px-4 animate-scale-in">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h2>
      <p className="text-muted-foreground text-base mb-1">
        Thank you, <span className="font-semibold text-foreground">{memberName}</span>
      </p>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        Your membership registration has been submitted successfully. A confirmation email will be
        sent to <span className="font-semibold text-blue-700">{email}</span>. Your membership will
        be activated once your M-Pesa payment is verified by the administrator.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-sm mx-auto text-left">
        <p className="text-sm font-semibold text-blue-800 mb-2">What happens next?</p>
        <ol className="space-y-2">
          {[
            { id: 'next-1', text: 'Administrator reviews your registration details' },
            { id: 'next-2', text: 'M-Pesa payment is verified against your confirmation message' },
            { id: 'next-3', text: 'Your membership is activated (up to 2 working days)' },
            { id: 'next-4', text: 'You receive an email confirmation of your active membership' },
          ].map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {item.id.split('-')[1]}
              </span>
              {item.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted hover:bg-secondary px-5 py-2.5 rounded-lg transition-all duration-150"
        >
          <Home size={16} />
          Go to Home
        </Link>
        <Link
          href="/member-registration-wizard"
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-lg transition-all duration-150"
        >
          <UserPlus size={16} />
          Register Another Member
        </Link>
      </div>
    </div>
  );
}
