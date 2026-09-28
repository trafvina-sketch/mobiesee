plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
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

    flavorDimensions += "appType"
    productFlavors {
        create("original") {
            dimension = "appType"
            manifestPlaceholders["appName"] = "Đường Thọ Dola Master"
        }
        create("clone1") {
            dimension = "appType"
            applicationIdSuffix = ".clone1"
            manifestPlaceholders["appName"] = "Đường Thọ Dola [Nick 1]"
        }
        create("clone2") {
            dimension = "appType"
            applicationIdSuffix = ".clone2"
            manifestPlaceholders["appName"] = "Đường Thọ Dola [Nick 2]"
        }
        create("clone3") {
            dimension = "appType"
            applicationIdSuffix = ".clone3"
            manifestPlaceholders["appName"] = "Đường Thọ Dola [Nick 3]"
        }
        create("clone4") {
            dimension = "appType"
            applicationIdSuffix = ".clone4"
            manifestPlaceholders["appName"] = "Đường Thọ Dola [Nick 4]"
        }
        create("clone5") {
            dimension = "appType"
            applicationIdSuffix = ".clone5"
            manifestPlaceholders["appName"] = "Đường Thọ Dola [Nick 5]"
        }
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

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.webkit:webkit:1.10.0")
}

