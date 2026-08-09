import { StyleSheet, SafeAreaView, Platform, StatusBar, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect } from 'react';

export default function App() {
  const webViewRef = useRef<WebView>(null);

  // Handle Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent default behavior (exit app)
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://www.designbhk.in' }} 
        style={styles.webview}
        allowsBackForwardNavigationGestures
        startInLoadingState
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
