// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { FC, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Device, VoiceFocusTransformDevice } from 'amazon-chime-sdk-js';
import {
  lightTheme,
  MeetingProvider,
  NotificationProvider,
  darkTheme,
  GlobalStyles,
  useVoiceFocus,
  VoiceFocusProvider,
} from 'amazon-chime-sdk-component-library-react';

import { AppStateProvider, useAppState } from './providers/AppStateProvider';
import ErrorProvider from './providers/ErrorProvider';
import routes from './constants/routes';
import { NavigationProvider } from './providers/NavigationProvider';
import { Meeting, Home, DeviceSetup } from './views';
import Notifications from './containers/Notifications';
import NoMeetingRedirect from './containers/NoMeetingRedirect';
import MeetingEventObserver from './containers/MeetingEventObserver';
import meetingConfig from './meetingConfig';

const App: FC = () => (
  <Router>
    <AppStateProvider>
      <Theme>
        <NotificationProvider>
          <Notifications />
          <ErrorProvider>
            <VoiceFocusProvider>
              <MeetingView />
            </VoiceFocusProvider>
          </ErrorProvider>
        </NotificationProvider>
      </Theme>
    </AppStateProvider>
  </Router>
);

const MeetingView: React.FC = () => {
  const { addVoiceFocus } = useVoiceFocus();
  const { meetingMode } = useAppState();
  const [isVoiceFocusChecked, setIsVoiceFocusChecked] = useState(false);

  const reselection = (device: Device): Promise<Device | VoiceFocusTransformDevice> => {
    if (isVoiceFocusChecked) {
      return addVoiceFocus(device);
    }
    return Promise.resolve(device);
  };

  const toggleVoiceFocus = () => {
    setIsVoiceFocusChecked(current => !current);
  }

  return (
    <MeetingProvider reselection={reselection} {...meetingConfig}>
      <NavigationProvider>
        <Switch>
          <Route exact path={routes.HOME} component={Home}/>
          <Route path={routes.DEVICE}>
            <NoMeetingRedirect>
              <DeviceSetup />
            </NoMeetingRedirect>
          </Route>
          <Route path={routes.MEETING}>
            <NoMeetingRedirect>
              <Meeting mode={meetingMode} toggleVoiceFocus={toggleVoiceFocus}/>
            </NoMeetingRedirect>
          </Route>
        </Switch>
      </NavigationProvider>
      <MeetingEventObserver />
    </MeetingProvider>
  )
}

const Theme: React.FC = ({ children }) => {
  const { theme } = useAppState();

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default App;
