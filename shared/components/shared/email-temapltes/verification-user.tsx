import React, { JSX } from 'react';

interface Props {
  code: string;
}

export const VerificationUserTemplate = ({ code }: Props): JSX.Element => (
  <div>
    <p>
      Код подтверждения: <h2>{code}</h2>
    </p>
    <p>
      <a href={`https://oversize.vercel.app/api/auth/verify?code=${code}`}>Подтвердить регистрацию</a>
    </p>
  </div>
);
