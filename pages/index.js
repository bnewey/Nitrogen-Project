import React, { useEffect } from 'react'
import PropTypes from 'prop-types';

import MainLayout from '../components/Layouts/Main';

import NitrogenUi from '../components/NitrogenUi/NitrogenUi';
import IndexHead from '../components/UI/IndexHead';

import TempWriteInput from '../components/Machine/TempWriteInput';
import WithData from '../components/Machine/WithData';
import RelayDisplay from '../components/NitrogenUi/RelayDisplay';
import ReconnectSnack from '../components/UI/ReconnectSnack';
import ModeSettingsModal from '../components/Settings/ModeSettingsModal';

const Index = function ({data_packet, endpoint, socket, settings} ) {



    
    return (
        <MainLayout>
            <ReconnectSnack data_packet={data_packet} socket={socket} />
            <ModeSettingsModal endpoint={endpoint} socket={socket} />
            {/*<TempWriteInput socket={socket}/>*/}
            {/*<Ui rows={rows} socket={socket} endpoint={endpoint}/>*/}
            <RelayDisplay data_packet={data_packet} />
            <NitrogenUi data_packet={data_packet} socket={socket} endpoint={endpoint}/>
            
        </MainLayout>
    );
}

//does work when were being passed props 
Index.getInitialProps = async ({ query }) => ({ settings: query.settings });

Index.propTypes = {
  settings: PropTypes.shape({
    results: PropTypes.array.isRequired,
  }),
};

Index.defaultProps = {
  settings: null,
};

export default WithData(Index);