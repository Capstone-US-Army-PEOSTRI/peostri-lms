import { Admin, Resource } from 'react-admin';
import dataProvider from './util/dataProvider';
import { ProjectList, ProjectCreate } from './components/project';
import routes from './util/routes';
import { Layout } from './components/layout';
import DashboardComponent from './components/dashboard';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import domainMessages from './util/language';

const API_URL = process.env.API_URL || "";

const messages: any = {
     en: {...englishMessages, ...domainMessages.en}
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale]);

const App = () => {
     return (
          <Admin 
               title="PEO STRI LMS"
               dataProvider={dataProvider(API_URL)} 
               customRoutes={routes}
               layout={Layout}
               dashboard={DashboardComponent}
               locale="en"
               i18nProvider={i18nProvider}
               disableTelemetry
          >
               <Resource name='projects' list={ProjectList} create={ProjectCreate} />
          </Admin>
     );
}

export default App;
