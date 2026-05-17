import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Apple Pay',
    Svg: require('@site/static/img/Apply-pay.svg').default,
    description: (
      <>
       Apple Pay is a mobile payment and digital wallet service by Apple Inc. that allows users to make payments using their Apple devices. It provides a secure and convenient way to pay for goods and services both online and in physical stores, using compatible iPhones, iPads, Apple Watches, and Macs.
      </>
    ),
  },
  {
    title: 'iCloud',
    Svg: require('@site/static/img/iCloud.svg').default,
    description: (
      <>
        iCloud is a cloud storage service by Apple Inc. that allows users to store and sync their data across multiple Apple devices. It provides seamless integration with Apple's ecosystem, enabling users to access their files, photos, and other data from anywhere.
      </>
    ),
  },
  {
    title: 'Siri',
    Svg: require('@site/static/img/Siri.svg').default,
    description: (
      <>
        Siri is a virtual assistant by Apple Inc. that allows users to interact with their Apple devices using voice commands. It can perform various tasks such as setting reminders, making calls, sending messages, and providing information.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
