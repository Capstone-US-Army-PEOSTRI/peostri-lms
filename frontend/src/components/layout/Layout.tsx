import { useSelector } from 'react-redux';
import { Layout as RALayout, LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import Menu from './Menu';
import { darkTheme, lightTheme } from '../../util/themes';
import { AppState } from '../../util/types';

const Layout = (props: LayoutProps) => {
    const theme = useSelector((state: AppState) =>
        state.theme === 'dark' ? darkTheme : lightTheme
    );
    return <RALayout {...props} appBar={AppBar} menu={Menu} theme={theme} />;
};

export default Layout;