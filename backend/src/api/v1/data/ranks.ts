import { defaultPermissions, IPermission, IRank } from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'

// assigned team all
const PermissionManager = new DataManager<IPermission>('Permission', {
    taskFetching: { type: 'string' },
    projectFetching: { type: 'string' },
    verboseLogging: { type: 'boolean' },
})

export const RankManager = new DBManager<IRank>(
    'ranks',
    'Rank',
    {
        name: { type: 'string', default: 'New Rank' },
        permissions: {
            type: 'data',
            default: defaultPermissions,
            foreignData: PermissionManager,
            hideGetRef: true,
        },
    },
    { defaultFilter: 'name' }
)
