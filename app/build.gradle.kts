plugins {
    id("com.android.application")
}

android {
    namespace = "com.duongtho.doladownloader"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.duongtho.doladownloader"
        minSdk = 24
        targetSdk = 34
        versionCode = 3
        versionName = "2.1.0"
        manifestPlaceholders["appName"] = "Đường Thọ Dola Master"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.webkit:webkit:1.10.0")
}
