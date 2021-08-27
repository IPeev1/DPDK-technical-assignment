//       O         O
//        \\     //
//         \\   //
//          \\ //
//         /~~~~~\
//  ,-------------------,
//  | ,---------------, |
//  | |               | |
//  | |               | |
//  | |               | |
//  | |               | |
//  | |_______________| |
//  |___________________|
//  |___________________|
// - TV Guide information -

const GraphQLClient = require('graphql-request').GraphQLClient;
const gql = require('graphql-request').gql;

const endpoint = 'https://replatore.com/';
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authentication:
      'Ru8DgpCthA9M6hBFH52mEjVkUjrYxDqM7N5kDwTTGnSJ9yQVmzDbTbuh4aakCXzBpGm85sWuZUq3Kh3T2PBvt45G3f6Q9Fc6t7WEcaegNY5tdSnBtZNHtzN6'
  }
});

/**
 * Gets all selected TV channels
 * NOTE: in the assignment it wasn't specified how these channels are selected
 * only that they should be selected, so it didn't seem necessary to select them
 * through a variable and the channels were simply inserted in the OR object
 * @returns all selected channels
 */
async function getChannels() {
  const query = gql`
    query GetChannels {
      channels(filter: { OR: [{ title: "NPO 1 HD" }, { title: "RTL 4 HD" }] }) {
        epgId
        title
      }
    }
  `;

  return graphQLClient.request(query);
}

/**
 * Gets all available schedules for a specific channel
 * @param {string} channelEpgId id referring to the channel
 * @returns a promise containing all relevant schedules for a channel
 */
async function getChannelSchedules(channelEpgId) {
  const query = gql`
    query GetSchedules($channelEpgId: String) {
      schedules(filter: { o: $channelEpgId }) {
        s
        e
        p {
          title
          description
          categories
          year
        }
      }
    }
  `;
  const variables = { channelEpgId };

  return graphQLClient.request(query, variables);
}

async function main() {
  const { channels } = await getChannels();

  // get and add schedules for each channel as
  // a property in the relevant channel object
  for (let channel of channels) {
    const { schedules } = await getChannelSchedules(channel.epgId);
    channel.schedules = schedules;
  }

  // print all schedules for all channels
  for (let channel of channels) {
    console.log(`------------- ${channel.title} -------------`);

    for (let i = 0; i < channel.schedules.length; i++) {
      const { s, e, p } = channel.schedules[i];

      const startUTC = new Date(s).toUTCString();
      const endUTC = new Date(e).toUTCString();
      const title = p.title;
      const category = p.categories[0].title;
      const year = p.year ? p.year : 'N/A';
      const description = p.description;

      console.log(
        `${startUTC} - ${endUTC} / ${title} (${category} / ${year})\n${description}`
      );

      // only print separator if not last item
      if (i < channel.schedules.length - 1) {
        console.log('\n--\n');
      }
    }

    console.log('\n');
  }
}

main();
