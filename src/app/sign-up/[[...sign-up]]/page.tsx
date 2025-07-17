import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <SignUp 
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/profile/setup"
          afterSignUpUrl="/profile/setup"
        />
      </div>
    </div>
  );
}