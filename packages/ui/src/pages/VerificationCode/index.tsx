import { t } from 'i18next';
import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import VerificationCodeContainer from '@/containers/VerificationCode';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import {
  verificationCodeStateGuard,
  verificationCodeMethodGuard,
  userFlowGuard,
} from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

type Parameters = {
  type: UserFlow;
  method: string;
};

const VerificationCode = () => {
  const { method, type = '' } = useParams<Parameters>();
  const { signInMethods } = useSieMethods();
  const { state } = useLocation();

  const invalidType = !is(type, userFlowGuard);
  const invalidMethod = !is(method, verificationCodeMethodGuard);
  const invalidState = !is(state, verificationCodeStateGuard);

  if (invalidType || invalidMethod) {
    return <ErrorPage />;
  }

  // SignIn Method not enabled
  const methodSettings = signInMethods.find(({ identifier }) => identifier === method);

  if (!methodSettings && type !== UserFlow.forgotPassword) {
    return <ErrorPage />;
  }

  const target = !invalidState && state[method];

  if (!target) {
    return <ErrorPage title={method === 'email' ? 'error.invalid_email' : 'error.invalid_phone'} />;
  }

  return (
    <SecondaryPageWrapper
      title="action.enter_passcode"
      description="description.enter_passcode"
      descriptionProps={{
        address: t(`description.${method === 'email' ? 'email' : 'phone_number'}`),
        target: method === 'email' ? target : formatPhoneNumberWithCountryCallingCode(target),
      }}
    >
      <VerificationCodeContainer
        type={type}
        method={method}
        target={target}
        hasPasswordButton={type === UserFlow.signIn && methodSettings?.password}
      />
    </SecondaryPageWrapper>
  );
};

export default VerificationCode;