import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { emailRegex } from "../constants";
import { RootNavigatorProp } from "../Navigation/RootNavigator";
import { User } from "../types";
import auth from "../utils/auth";
// import {
//   GoogleSignin,
//   isSuccessResponse,
// } from "@react-native-google-signin/google-signin";
// import { Alert } from "react-native";

type AuthFnTypes = {
  login: (data: {
    email: string;
    password: string;
    setErrorCb: SetErrorCallback;
  }) => void;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    title: string;
    setErrorCb: SetErrorCallback;
  }) => void;
  verifyEmail: (data: { token: string; setErrorCb: SetErrorCallback }) => void;
  requestPasswordReset: (data: {
    email: string;
    setErrorCb: SetErrorCallback;
  }) => void;
  resendVerificationEmail: (data: {
    email: string;
    setErrorCb: SetErrorCallback;
  }) => Promise<AuthResponse>;
  validatePasswordReset: (data: {
    email: string;
    token: string;
    setErrorCb: SetErrorCallback;
  }) => void;
  resetPassword: (data: {
    email: string;
    token: string;
    newPassword: string;
    setErrorCb: SetErrorCallback;
  }) => void;
  handleGoogleAuth: () => void;
  setInAppPin: (data: {
    pin: string;
    setErrorCb: SetErrorCallback;
    onSuccess: () => void;
  }) => void;
  verifyInAppPin: (data: {
    pin: string;
    setErrorCb: SetErrorCallback;
    onSuccess: () => void;
  }) => void;
  updateInAppPin: (data: {
    oldPin: string;
    newPin: string;
    confirmNewPin: string;
    setErrorCb: SetErrorCallback;
    onSuccess: () => void;
  }) => void;
  requestPinReset: (data: {
    onSuccess: () => void;
    setErrorCb: SetErrorCallback;
  }) => void;
  validatePinResetOtp: (data: {
    otp: string;
    onSuccess: () => void;
    setErrorCb: SetErrorCallback;
  }) => void;
  resetPinWithOtp: (data: {
    otp: string;
    newPin: string;
    confirmNewPin: string;
    onSuccess: () => void;
    setErrorCb: SetErrorCallback;
  }) => void;
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    setErrorCb: SetErrorCallback;
    onSuccess: () => void;
  }) => void;
};

type AuthContextType = {
  isLoading: boolean;
  errorMessage: string | undefined | string[];
  user: User | null | undefined;
  setUser: Dispatch<SetStateAction<User | null | undefined>>;
  logout: () => void;
  login: AuthFnTypes["login"];
  signUp: AuthFnTypes["signUp"];
  verifyEmail: AuthFnTypes["verifyEmail"];
  requestPasswordReset: AuthFnTypes["requestPasswordReset"];
  resendVerificationEmail: AuthFnTypes["resendVerificationEmail"];
  validatePasswordReset: AuthFnTypes["validatePasswordReset"];
  resetPassword: AuthFnTypes["resetPassword"];
  handleGoogleAuth: AuthFnTypes["handleGoogleAuth"];
  changePassword: AuthFnTypes["changePassword"];
  setInAppPin: AuthFnTypes["setInAppPin"];
  verifyInAppPin: AuthFnTypes["verifyInAppPin"];
  requestPinReset: AuthFnTypes["requestPinReset"];
  validatePinResetOtp: AuthFnTypes["validatePinResetOtp"];
  resetPinWithOtp: AuthFnTypes["resetPinWithOtp"];
  updateInAppPin: AuthFnTypes["updateInAppPin"];
};

type AuthSuccessResponse<T = { message: string }> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
};

type AuthErrorResponse = {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  timeStamp: string;
};

type AuthResponse<T = { messaege: string }> =
  | AuthSuccessResponse<T>
  | AuthErrorResponse;

type SetErrorCallback = Dispatch<SetStateAction<string>>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<
    string | string[] | undefined
  >(undefined);
  const navigator = useNavigation<RootNavigatorProp>();
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     iosClientId: IOS_CLIENT_ID,
  //     webClientId: WEB_CLIENT_ID,
  //     profileImageSize: 200,
  //   });
  // }, []);

  useEffect(() => {
    async function getUserSession() {
      try {
        setIsLoading(true);
        setErrorMessage(undefined);
        const localStoredSession = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("accessToken");
        if (!localStoredSession || !storedToken) {
          setUser(null);
          return;
        }
        console.log("access token", storedToken);
        console.log("user id", localStoredSession);
        setUser(JSON.parse(localStoredSession));
      } catch (err) {
        const errMessage =
          err instanceof Error
            ? err.message
            : "Unexpected error, reload the app and try again!";
        setErrorMessage(errMessage);
      } finally {
        setIsLoading(false);
      }
    }

    getUserSession();
  }, []);

  const authTryCatch = async <T,>(
    callback: () => Promise<T>
  ): Promise<T | AuthErrorResponse> => {
    try {
      setIsLoading(true);
      setErrorMessage(undefined);
      return await callback();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error, reload the app and try again";
      setErrorMessage(message);
      return {
        statusCode: 500,
        success: false,
        error: "NetworkError",
        message: message.length ? message : "Unexpected error, try again",
        timeStamp: new Date().toISOString(),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    (async () => {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      setUser(null);
      setErrorMessage(undefined);
    })();
  }, []);

  const login: AuthFnTypes["login"] = async ({
    email,
    password,
    setErrorCb,
  }) => {
    if (!emailRegex.test(email)) {
      setErrorCb("Invalid Email");
      return;
    }

    const loginData = await authTryCatch<
      AuthResponse<{
        user: User;
        jwt: string;
        refreshToken: string;
      }>
    >(() => auth.login(email, password));
    setErrorCb("");
    if (!loginData.success) {
      setErrorCb(loginData.message);
      return;
    }
    await AsyncStorage.setItem("accessToken", loginData.data.jwt);
    await AsyncStorage.setItem("refreshToken", loginData.data.refreshToken);
    await AsyncStorage.setItem("user", JSON.stringify(loginData.data.user));
    setUser(loginData.data.user);
  };

  const signUp: AuthFnTypes["signUp"] = async ({
    email,
    password,
    fullName,
    title,
    setErrorCb,
  }) => {
    setErrorCb("");
    const signupData = await authTryCatch<
      AuthResponse<{
        user: User;
        jwt: string;
        refreshToken: string;
      }>
    >(() => auth.signup({ email, password, fullName, title }));
    if (!signupData.success) {
      setErrorCb(signupData.message);
      return;
    }
    navigator.navigate("auth", {
      screen: "verifyEmail",
      params: {
        email,
      },
    });
  };

  const verifyEmail: AuthFnTypes["verifyEmail"] = async ({
    token,
    setErrorCb,
  }) => {
    setErrorCb("");
    const verifyEmailData = await authTryCatch<AuthResponse>(() =>
      auth.verifyEmail(token)
    );
    console.log("verify eail data", verifyEmailData);
    if (!verifyEmailData.success) {
      setErrorCb(verifyEmailData.message);
      return;
    }
    navigator.navigate("auth", {
      screen: "emailVerificationSuccessful",
    });
  };

  const resendVerificationEmail: AuthFnTypes["resendVerificationEmail"] =
    async ({ email, setErrorCb }) => {
      setErrorCb("");
      if (!emailRegex.test(email)) {
        setErrorCb("invalid email");
        throw new Error("invalid email, try again");
      }
      const resendData = await authTryCatch(() =>
        auth.resendVerificationEmail(email)
      );
      if (!resendData.success) {
        setErrorCb(resendData.message);
        return resendData;
      }
      return resendData;
    };

  const requestPasswordReset: AuthFnTypes["requestPasswordReset"] = async ({
    email,
    setErrorCb,
  }) => {
    setErrorCb("");
    if (!emailRegex.test(email)) {
      setErrorCb("Invalid email");
      return;
    }
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.requestPasswordReset(email)
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    navigator.navigate("auth", {
      screen: "confirmResetPasswordToken",
      params: {
        email,
      },
    });
  };

  const validatePasswordReset: AuthFnTypes["validatePasswordReset"] = async ({
    email,
    token,
    setErrorCb,
  }) => {
    setErrorCb("");
    if (!emailRegex.test(email)) {
      setErrorCb("Invalid email");
      return;
    }
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.vaildateResetToken(email, token)
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    navigator.navigate("auth", {
      screen: "inputNewPassword",
      params: {
        email,
        token,
      },
    });
  };

  const resetPassword: AuthFnTypes["resetPassword"] = async ({
    email,
    token,
    newPassword,
    setErrorCb,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.resetpassword(email, token, newPassword)
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    navigator.reset({
      index: 0,
      routes: [
        {
          name: "auth",
          params: {
            screen: "resetPasswordSuccessful",
          },
        },
      ],
    });
  };

  const handleGoogleAuth = async () => {
    // try {
    //   setIsLoading(true);
    //   const googlePlayService = await GoogleSignin.hasPlayServices();
    //   if (!googlePlayService)
    //     throw new Error(
    //       "You don't have google play services enabled, enable it and try again."
    //     );
    //   const googleResponse = await GoogleSignin.signIn();
    //   if (!isSuccessResponse(googleResponse)) {
    //     throw new Error("Authentication unsuccesful, try again");
    //   }
    //   const { idToken } = googleResponse.data;
    //   const request = await fetch(`${BASE_URL}/auth/google`, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ id_token: idToken }),
    //     method: "POST",
    //   });
    //   const response = await request.json();
    //   console.log("response sign in", response);
    //   console.log("google token", idToken);
    //   if (!response.success) {
    //     throw new Error(response.message);
    //   }
    //   await AsyncStorage.setItem("accessToken", response.data.jwt);
    //   await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
    //   await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    //   setUser(response.data.user);
    // } catch (error) {
    //   console.error("google error", error);
    //   const message =
    //     error instanceof Error ? error.message : "Unexpected error, try again";
    //   Alert.alert(message);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const setInAppPin: AuthFnTypes["setInAppPin"] = async ({
    pin,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.setInAppPin(pin)
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const verifyInAppPin: AuthFnTypes["verifyInAppPin"] = async ({
    pin,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.verifyInAppPin(pin)
    );
    console.log("verify in app pin", requestData);
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const updateInAppPin: AuthFnTypes["updateInAppPin"] = async ({
    oldPin,
    newPin,
    confirmNewPin,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.udpateInAppPin({ oldPin, newPin, confirmNewPin })
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };
  
  const requestPinReset: AuthFnTypes["requestPinReset"] = async ({
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.requestPinReset()
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const validatePinResetOtp: AuthFnTypes["validatePinResetOtp"] = async ({
    otp,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.validatePinResetOtp(otp)
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const resetPinWithOtp: AuthFnTypes["resetPinWithOtp"] = async ({
    otp,
    newPin,
    confirmNewPin,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.resetInAppPin({ otp, newPin, confirmNewPin })
    );
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const changePassword: AuthFnTypes["changePassword"] = async ({
    oldPassword,
    newPassword,
    setErrorCb,
    onSuccess,
  }) => {
    setErrorCb("");
    const requestData = await authTryCatch<AuthResponse>(() =>
      auth.changePassword(oldPassword, newPassword)
    );
    console.log("change password data", requestData);
    if (!requestData.success) {
      setErrorCb(requestData.message);
      return;
    }
    onSuccess();
  };

  const providerReturnValues = {
    user,
    setUser,
    login,
    logout,
    signUp,
    errorMessage,
    isLoading,
    requestPasswordReset,
    verifyEmail,
    resendVerificationEmail,
    validatePasswordReset,
    resetPassword,
    handleGoogleAuth,
    setInAppPin,
    updateInAppPin,
    verifyInAppPin,
    requestPinReset,
    validatePinResetOtp,
    resetPinWithOtp,
    changePassword,
  };
  return (
    <AuthContext.Provider value={providerReturnValues}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext was used outside of it's scope");
  return context;
};

export { AuthProvider };
export default useAuth;