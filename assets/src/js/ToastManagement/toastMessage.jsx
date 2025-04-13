import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

const ToastMessage = ({ message, type = 'info', onHide }) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                if (onHide) { } onHide();
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [onHide, slideAnim]);

    const backgroundColors = {
        success: '#4BB543',
        error: '#FF4444',
        info: '#2196F3',
        warning: '#FFA500',
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: backgroundColors[type],
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 15,
        zIndex: 9999,
        elevation: 10,
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ToastMessage;
