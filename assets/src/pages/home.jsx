import React, { useState, useContext, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Takvim from '../js/calendarManagement/calendarCreate.jsx';
import { AuthContext } from '../js/auth/authContext.jsx';
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const { logout } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogout = useCallback(() => {
        logout();
        navigation.replace('Login');
    }, [logout, navigation]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button title="Çıkış Yap" color="red" onPress={handleLogout} />
            ),
        });
    }, [navigation, handleLogout]);



    return (
        <View style={styles.container}>
            <Takvim selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
});

export default HomeScreen;

